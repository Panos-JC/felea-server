import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { Users } from "../../../entities/Users";
import { MyContext } from "../../../types";
import { getRepository } from "typeorm";
import { v4 } from "uuid";
import argon2 from "argon2";

import { FORGET_PASSWORD_PREFIX, FRONTEND_URL } from "../../../constants";
import { sendEmail } from "../../../utils/sendEmail";
import { UserResponse } from "../register/register.response";
import { isAuth } from "../../../middleware/isAuth";

@Resolver()
export class ChangePasswordResolver {
  private user = getRepository(Users);

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<boolean> {
    const user = await this.user.findOne({ where: { email } });

    if (!user) {
      // the email is not in the db
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 1 // 1 day
    );

    sendEmail(
      email,
      `<a href="${FRONTEND_URL}/change-password/${token}" >Reset password</a>`
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 8) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password must be at least 8 characters",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await this.user.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await this.user.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );

    redis.del(key);

    return { user };
  }

  @Mutation(() => UserResponse)
  @UseMiddleware(isAuth)
  async changeKnownPassword(
    @Arg("oldPassword") oldPassword: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 8) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password must be at least 8 characters",
          },
        ],
      };
    }

    const user = await this.user.findOne(req.session.userId);

    if (!user) {
      return { errors: [{ field: "general", message: "User not found" }] };
    }

    const valid = await argon2.verify(user.password, oldPassword);

    if (!valid) {
      return {
        errors: [
          {
            field: "oldPassword",
            message: "The password you provided is not correct",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(newPassword);

    user.password = hashedPassword;
    await this.user.save(user);

    return { user };
  }
}
