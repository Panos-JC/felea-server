import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Mentor } from "../entities/Mentor";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { MentorDetailsInput } from "./inputTypes/MentorDetailsInput";

@ObjectType()
class ErrorMessage {
  @Field()
  message: string;
}

@ObjectType()
class MentorResponse {
  @Field(() => ErrorMessage, { nullable: true })
  error?: ErrorMessage;

  @Field(() => Mentor, { nullable: true })
  mentor?: Mentor;
}

@Resolver()
export class MentorResolver {
  @Query(() => Mentor)
  async mentor(@Arg("mentorId", () => Int) mentorId: number): Promise<Mentor> {
    const result = await getConnection()
      .getRepository(Mentor)
      .createQueryBuilder("mentor")
      .innerJoinAndSelect("mentor.user", "users")
      .where("mentor.id = :id", { id: mentorId })
      .getOne();

    console.log(result);
    return result!;
  }

  @Query(() => [Mentor])
  async mentors(): Promise<Mentor[]> {
    const mentors = await Mentor.find({ relations: ["user"] });

    console.log(mentors);
    return mentors;
  }

  @Mutation(() => MentorResponse)
  // @UseMiddleware(isAuth)
  async setMentorDetails(
    @Arg("options", () => MentorDetailsInput) options: MentorDetailsInput,
    @Ctx() { req }: MyContext
  ): Promise<MentorResponse> {
    // get mentor by user id
    const mentor = await Mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (mentor) {
      mentor.firstName = options.firstName;
      mentor.lastName = options.lastName;
      mentor.title = options.title;
      mentor.rate = options.rate;
      mentor.location = options.location;
      mentor.languages = options.languages;

      const updatedMentor = await Mentor.save(mentor);

      return { mentor: updatedMentor };
    } else {
      return {
        error: { message: "Something went wrong while setting details" },
      };
    }
  }

  @Mutation(() => MentorResponse)
  async setBio(
    @Arg("bio", () => String) bio: string,
    @Ctx() { req }: MyContext
  ): Promise<MentorResponse> {
    // get mentor by user id
    const mentor = await Mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (mentor) {
      mentor.bio = bio;

      const updatedMentor = await Mentor.save(mentor);

      return { mentor: updatedMentor };
    } else {
      return {
        error: { message: "Something went wrong while setting details" },
      };
    }
  }
}
