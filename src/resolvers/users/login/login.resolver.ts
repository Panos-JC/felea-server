import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Users } from "../../../entities/Users";
import { MyContext } from "../../../types";
import { UserResponse } from "../register/register.response";
import argon2 from "argon2";
import { getRepository } from "typeorm";
import { COOKIE_NAME } from "../../../constants";

@Resolver()
export class LoginResolver {
  private user = getRepository(Users);

  @Mutation(() => UserResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // check if user exists
    const _user = await Users.findOne({ email });

    if (!_user) {
      return {
        errors: [
          {
            field: "general",
            message: "Wrong email or password",
          },
        ],
      };
    }

    // if (!_user.activated) {
    //   return {
    //     errors: [
    //       {
    //         field: "general",
    //         message: "Please activate you email",
    //       },
    //     ],
    //   };
    // }

    // check if password is correct
    const valid = await argon2.verify(_user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "general",
            message: "Wrong email or password",
          },
        ],
      };
    }

    // get user and user's info depending on user's type
    const user = await this.user
      .createQueryBuilder("u")
      .innerJoinAndSelect(`u.${_user.type}`, _user.type)
      .where("u.id = :id", { id: _user.id })
      .getOne();

    if (!user) {
      return {
        errors: [
          {
            field: "general",
            message: "Something went wrong",
          },
        ],
      };
    }

    // store userId in session
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
