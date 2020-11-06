import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { getConnection, getManager } from "typeorm";
import { Users } from "../entities/Users";
import { validateRegister } from "../utils/validateRegister";
import { RegisterInput } from "./inputTypes/RegisterInput";
import argon2 from "argon2";
import { Individual } from "../entities/Individual";
// import { Type } from "../entities/Type";
import { Mentor } from "../entities/Mentor";
import { MyContext } from "../types";
import {
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
  FRONTEND_URL,
  GENERATE_MENTOR_PREFIX,
} from "../constants";
import { Admin } from "../entities/Admin";
import { Company } from "../entities/Company";
import { v4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Users, { nullable: true })
  user?: Users;
}

@Resolver()
export class UsersResolver {
  @Query(() => Users, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const _user = await Users.findOne({ id: req.session.userId });

    if (!_user) {
      console.log("ME QUERY ERROR");
      return null;
    }

    const user = await getConnection()
      .getRepository(Users)
      .createQueryBuilder("u")
      .innerJoinAndSelect(`u.${_user.type}`, _user.type)
      .where("u.id = :id", { id: _user.id })
      .getOne();

    console.log(user);

    return user;
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<boolean> {
    const user = await Users.findOne({ where: { email } });

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
    @Ctx() { redis, req }: MyContext
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
    const user = await Users.findOne(userIdNum);

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

    await Users.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );

    redis.del(key);

    return { user };
  }

  // === REGISTER INDIVIDUAL MUTATION ===
  @Mutation(() => UserResponse)
  async registerIndividual(
    @Arg("options", () => RegisterInput) options: RegisterInput
  ): Promise<UserResponse> {
    // validate options
    const errors = validateRegister(options);

    if (errors) return { errors };

    const company = await Company.findOne({ where: { code: options.code } });

    if (!company && options.code) {
      return {
        errors: [
          {
            field: "code",
            message: "Your code is invalid",
          },
        ],
      };
    }

    if (company && company.remainingAccounts < 1) {
      return {
        errors: [
          {
            field: "code",
            message: "This code has expired",
          },
        ],
      };
    }

    // check if email already exists
    const result = await Users.findOne({ email: options.email });

    if (result) {
      return {
        errors: [
          {
            field: "email",
            message: "Email already exists",
          },
        ],
      };
    }

    //hash password
    const hashedPassword = await argon2.hash(options.password);

    // execute queries in a transaction
    const user = await getManager().transaction(
      async (transactionalEntityManager) => {
        // get company from code if it exists

        // create user
        const user = new Users();
        user.email = options.email;
        user.password = hashedPassword;
        user.type = "individual";
        await transactionalEntityManager.save(user);

        // create individual
        const individual = new Individual();
        individual.firstName = options.firstName;
        individual.lastName = options.lastName;
        individual.user = user;

        if (company) {
          individual.company = company;
          individual.premium = true;
          company.remainingAccounts -= 1;
          await company.save();
        }

        await transactionalEntityManager.save(individual);

        // get User with Individual info
        const individualUser = await transactionalEntityManager
          .getRepository(Users)
          .createQueryBuilder("u")
          .where("u.id = :id", { id: user.id })
          .innerJoinAndSelect("u.individual", "individual")
          .getOne();

        console.log(individualUser);

        return individualUser;
      }
    );

    return { user };
  }

  // === REGISTER MENTOR MUTATION ===
  @Mutation(() => UserResponse)
  async registerMentor(
    @Arg("options", () => RegisterInput) options: RegisterInput,
    @Arg("token", () => String) token: string,
    @Ctx() { redis }: MyContext
  ): Promise<UserResponse> {
    // validate options
    const errors = validateRegister(options);

    if (errors) return { errors };

    const key = GENERATE_MENTOR_PREFIX + token;
    const email = await redis.get(key);

    if (!email) {
      return {
        errors: [
          { field: "token", message: "Token has expired, please contact us." },
        ],
      };
    }

    // check if email already exists
    const result = await Users.findOne({ email: options.email });

    if (result) {
      return {
        errors: [
          {
            field: "email",
            message: "Email already exists",
          },
        ],
      };
    }

    //hash password
    const hashedPassword = await argon2.hash(options.password);

    // execute queries in a transaction
    const user = await getManager().transaction(
      async (transactionalEntityManager) => {
        // create user
        const user = new Users();
        user.email = options.email;
        user.password = hashedPassword;
        user.type = "mentor";
        await transactionalEntityManager.save(user);

        // create mentor
        const mentor = new Mentor();
        mentor.firstName = options.firstName;
        mentor.lastName = options.lastName;
        mentor.user = user;
        await transactionalEntityManager.save(mentor);

        // get User with Mentor info
        const mentorUser = await transactionalEntityManager
          .getRepository(Users)
          .createQueryBuilder("u")
          .where("u.id = :id", { id: user.id })
          .innerJoinAndSelect("u.mentor", "mentor")
          .getOne();

        console.log(mentorUser);

        return mentorUser;
      }
    );

    redis.del(key);

    return { user };
  }

  // === REGISTER ADMIN MUTATION ===
  @Mutation(() => UserResponse)
  async registerAdmin(
    @Arg("options", () => RegisterInput) options: RegisterInput
  ): Promise<UserResponse> {
    // validate options
    const errors = validateRegister(options);

    if (errors) return { errors };

    // check if email already exists
    const result = await Users.findOne({ email: options.email });

    if (result) {
      return {
        errors: [
          {
            field: "email",
            message: "Email already exists",
          },
        ],
      };
    }

    //hash password
    const hashedPassword = await argon2.hash(options.password);

    // execute queries in a transaction
    const user = await getManager().transaction(
      async (transactionalEntityManager) => {
        // create user
        const user = new Users();
        user.email = options.email;
        user.password = hashedPassword;
        user.type = "admin";
        await transactionalEntityManager.save(user);

        // create admin
        const admin = new Admin();
        admin.firstName = options.firstName;
        admin.lastName = options.lastName;
        admin.user = user;
        await transactionalEntityManager.save(admin);

        // get User with Admin info
        const adminUser = await transactionalEntityManager
          .getRepository(Users)
          .createQueryBuilder("u")
          .where("u.id = :id", { id: user.id })
          .innerJoinAndSelect("u.admin", "admin")
          .getOne();

        console.log(adminUser);

        return adminUser;
      }
    );

    return { user };
  }

  // ==== LOGIN MUTATION ====

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
            field: "email",
            message: "User does not exist",
          },
        ],
      };
    }

    // check if password is correct
    const valid = await argon2.verify(_user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }

    // get user and user's info depending on user's type
    const user = await getConnection()
      .getRepository(Users)
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

    console.log(user);
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

  @Mutation(() => UserResponse)
  async addAvatar(
    @Arg("avatarUrl") avatarUrl: string,
    @Arg("publicId") publicId: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await Users.findOne({ where: { id: req.session.userId } });

    if (!user) {
      return { errors: [{ field: "avatar", message: "User not found" }] };
    }

    user.avatar = avatarUrl;
    user.avatarPublicId = publicId;
    await user.save();

    return { user };
  }
}
