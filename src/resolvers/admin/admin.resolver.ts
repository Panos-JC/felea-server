import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Admin } from "../../entities/Admin";
import { v4 } from "uuid";
import { Users } from "../../entities/Users";
import { MyContext } from "../../types";
import {
  FRONTEND_URL,
  GENERATE_ADMIN_PREFIX,
  GENERATE_MENTOR_PREFIX,
} from "../../constants";
import { isAdminAuth } from "../../middleware/isAdminAuth";
import { send } from "../../utils/send";
import { GenerateUserResponse } from "./admin.response";
import { getRepository } from "typeorm";
import { Individual } from "../../entities/Individual";

@Resolver()
export class AdminResolver {
  private adminRepository = getRepository(Admin);
  private userRepository = getRepository(Users);
  private individualRepository = getRepository(Individual);

  @Query(() => [Admin])
  async admins(): Promise<Admin[]> {
    const admins = await this.adminRepository.find({ relations: ["user"] });
    return admins;
  }

  @Mutation(() => GenerateUserResponse)
  @UseMiddleware(isAdminAuth)
  async generateMentor(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<GenerateUserResponse> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      return { errorMsg: "Email already exists" };
    }

    const token = v4();

    await redis.set(
      GENERATE_MENTOR_PREFIX + token,
      email,
      "ex",
      1000 * 60 * 60 * 24 * 7 // 7 days
    );

    const subject = "Create your mentor account";

    send(email, subject, "createMentor", {
      link: `${FRONTEND_URL}/mentor-register/${token}`,
    });

    return { emailSent: true };
  }

  @Mutation(() => GenerateUserResponse)
  @UseMiddleware(isAdminAuth)
  async generateAdmin(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<GenerateUserResponse> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      return { errorMsg: "Email already exists" };
    }

    const token = v4();

    await redis.set(
      GENERATE_ADMIN_PREFIX + token,
      email,
      "ex",
      1000 * 60 * 60 * 24 * 7 // 7 days
    );

    const subject = "Create your admin account";

    send(email, subject, "createMentor", {
      link: `${FRONTEND_URL}/admin-register/${token}`,
    });

    return { emailSent: true };
  }

  @Mutation(() => Boolean)
  async assignFacilitator(
    @Arg("individualId", () => Int) individualId: number,
    @Arg("adminId", () => Int) adminId: number
  ): Promise<boolean> {
    const individual = await this.individualRepository.findOne(individualId);

    if (!individual) {
      throw new Error("Individual not found");
    }

    const admin = await this.adminRepository.findOne(adminId);

    if (!admin) {
      throw new Error("Admin not found");
    }

    individual.facilitator = admin;

    try {
      await this.individualRepository.save(individual);
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  }
}
