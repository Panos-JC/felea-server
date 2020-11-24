import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Admin } from "../../entities/Admin";
import { v4 } from "uuid";
import { Users } from "../../entities/Users";
import { MyContext } from "../../types";
import { FRONTEND_URL, GENERATE_MENTOR_PREFIX } from "../../constants";
import { sendEmail } from "../../utils/sendEmail";
import { isAdminAuth } from "../../middleware/isAdminAuth";

@ObjectType()
class GenerateMentorResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  emailSent?: boolean;
}

@Resolver()
export class AdminResolver {
  @Query(() => [Admin])
  async admins(): Promise<Admin[]> {
    const admins = await Admin.find({ relations: ["user"] });

    console.log(admins);
    return admins;
  }

  @Mutation(() => GenerateMentorResponse)
  @UseMiddleware(isAdminAuth)
  async generateMentor(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<GenerateMentorResponse> {
    const user = await Users.findOne({ where: { email } });

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

    sendEmail(
      email,
      `<a href="${FRONTEND_URL}/mentor-register/${token}" >Create your account</a>`
    );

    return { emailSent: true };
  }
}
