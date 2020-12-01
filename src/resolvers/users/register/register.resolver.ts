import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { getManager } from "typeorm";
import { Company } from "../../../entities/Company";
import { Individual } from "../../../entities/Individual";
import { Users } from "../../../entities/Users";
import { validateRegister } from "../../../utils/validateRegister";
import { RegisterInput } from "./register.input";
import { UserResponse } from "./register.response";
import argon2 from "argon2";
import { MyContext } from "../../../types";
import { FRONTEND_URL, GENERATE_MENTOR_PREFIX } from "../../../constants";
import { Mentor } from "../../../entities/Mentor";
import { Admin } from "../../../entities/Admin";
import { v4 } from "uuid";
import { send } from "../../../utils/send";

@Resolver()
export class RegisterResolver {
  @Mutation(() => UserResponse)
  // === REGISTER INDIVIDUAL MUTATION ===
  async registerIndividual(
    @Arg("options", () => RegisterInput) options: RegisterInput,
    @Ctx() { redis }: MyContext
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

    if (user) {
      const token = v4();

      await redis.set(token, user.id, "ex", 1000 * 60 * 60 * 24 * 7); // 7 days

      send(user.email, "Activate your account", "activateEmail", {
        link: `${FRONTEND_URL}/user/activate/${token}`,
      });
    }

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

    if (user) {
      const token = v4();

      await redis.set(token, user.id, "ex", 1000 * 60 * 60 * 24 * 7); // 7 days

      send(user.email, "Activate your account", "activateEmail", {
        link: `${FRONTEND_URL}/user/activate/${token}`,
      });
    }

    redis.del(key);

    return { user };
  }

  // === REGISTER ADMIN MUTATION ===
  @Mutation(() => UserResponse)
  async registerAdmin(
    @Arg("options", () => RegisterInput) options: RegisterInput,
    @Ctx() { redis }: MyContext
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

    if (user) {
      const token = v4();

      await redis.set(token, user.id, "ex", 1000 * 60 * 60 * 24 * 7); // 7 days

      send(user.email, "Activate your account", "activateEmail", {
        link: `${FRONTEND_URL}/user/activate/${token}`,
      });
    }

    return { user };
  }
}
