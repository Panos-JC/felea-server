import {
  Arg,
  Ctx,
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

@Resolver()
export class AdminResolver {
  private adminRepository = getRepository(Admin);
  private userRepository = getRepository(Users);

  @Query(() => [Admin])
  async admins(): Promise<Admin[]> {
    const admins = await this.adminRepository.find({ relations: ["user"] });

    console.log(admins);
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
}
