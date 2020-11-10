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
import { SessionRequest } from "../entities/SessionRequest";
import { isMentorAuth } from "../middleware/isMentorAuth";
import { MyContext } from "../types";
import { MentorDetailsInput } from "./inputTypes/MentorDetailsInput";
import { SocialLinksInput } from "./inputTypes/socialLinksInput";

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

@ObjectType()
class MentorInfoResponse {
  @Field(() => Number, { nullable: true })
  avg: number;

  @Field(() => Number)
  sessionCount: number;

  @Field(() => Mentor)
  info: Mentor;
}

@ObjectType()
class MentorsResponse {
  @Field(() => Mentor)
  mentor: Mentor;

  @Field(() => Number)
  sessions: number;

  @Field(() => Number, { nullable: true })
  avg: number;
}

@ObjectType()
class IsProfileCompleteResponse {
  @Field(() => [String])
  messages: string[];

  @Field(() => Boolean)
  isComplete: boolean;
}

@Resolver()
export class MentorResolver {
  @Query(() => MentorInfoResponse)
  async mentor(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<MentorInfoResponse> {
    const mentor = await Mentor.findOne({
      where: { id: mentorId },
      relations: ["user"],
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }
    const sessionCount = await getConnection()
      .getRepository(SessionRequest)
      .createQueryBuilder("req")
      .innerJoin("req.mentor", "mentor")
      .where("mentor.id = :id", { id: mentorId })
      .andWhere("req.status = 'complete'")
      .getCount();

    const { avg } = await getConnection()
      .getRepository(Mentor)
      .createQueryBuilder("mentor")
      .innerJoinAndSelect("mentor.reviews", "review")
      .select("AVG(review.rating)", "avg")
      .where("mentor.id = :id", { id: mentorId })
      .getRawOne();

    return { avg, info: mentor, sessionCount };
  }

  @Query(() => MentorInfoResponse)
  async loggedInMentor(@Ctx() { req }: MyContext): Promise<MentorInfoResponse> {
    const mentor = await Mentor.findOne({
      where: { user: { id: req.session.userId } },
      relations: ["user"],
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    const sessionCount = await getConnection()
      .getRepository(SessionRequest)
      .createQueryBuilder("req")
      .innerJoin("req.mentor", "mentor")
      .where("mentor.id = :id", { id: mentor.id })
      .andWhere("req.status = 'complete'")
      .getCount();

    const { avg } = await getConnection()
      .getRepository(Mentor)
      .createQueryBuilder("mentor")
      .innerJoinAndSelect("mentor.reviews", "review")
      .select("AVG(review.rating)", "avg")
      .where("mentor.id = :id", { id: mentor.id })
      .getRawOne();

    console.log("avg ", avg);
    return { info: mentor, sessionCount, avg };
  }

  @Query(() => [MentorsResponse])
  async mentors(
    @Arg("skills", () => [String]) skills: string[],
    @Arg("industries", () => [String]) industries: string[]
  ): Promise<MentorResponse[]> {
    // get mentor info plus sessions count
    const _mentors = getConnection()
      .manager.createQueryBuilder(Mentor, "mentor")
      .leftJoinAndSelect("mentor.user", "users")
      .leftJoinAndSelect("mentor.reviews", "review")
      .leftJoinAndSelect("mentor.expertises", "expertise")
      .leftJoinAndSelect("mentor.workExperience", "work_experience")
      .leftJoinAndSelect("work_experience.industries", "industry")
      .leftJoinAndSelect("expertise.skill", "skill")
      .where("mentor.profileComplete = true");
    // .where("to_tsvector(skill.name) @@ phraseto_tsquery(:q)", {
    //   q: "Advice on Funding",
    // });
    // .where("to_tsvector(industry.name) @@ to_tsquery(:q)", {
    //   q: "B2B | B2C",
    // });
    // .orderBy("review.rating", "DESC");

    if (skills.length > 0)
      _mentors.where("skill.name IN (:...names)", { names: skills });
    if (industries.length > 0)
      _mentors.where("industry.name IN (:...names)", { names: industries });

    const mentors = await _mentors.getMany();

    const data = mentors.map(async (mentor) => {
      const avg = await getConnection()
        .createQueryBuilder(Mentor, "mentor")
        .leftJoin("mentor.reviews", "r")
        .addSelect("AVG(DISTINCT r.rating)", "avg")
        .where("mentor.id = :id", { id: mentor.id })
        .addGroupBy("mentor.id")
        .getRawOne();

      const sessionCount = await getConnection()
        .createQueryBuilder(Mentor, "mentor")
        .innerJoin("mentor.sessionRequests", "sessions")
        .addSelect("COUNT(sessions)", "count")
        .where("sessions.status = 'complete'")
        .andWhere("mentor.id = :id", { id: mentor.id })
        .addGroupBy("mentor.id")
        .getRawOne();

      let sessions = 0;
      if (sessionCount) {
        sessions = sessionCount.count;
      }

      return { mentor, avg: avg.avg, sessions };
    });

    const result: MentorsResponse[] = await Promise.all(data);

    return result.sort((a, b) => b.avg - a.avg);
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
  @UseMiddleware(isMentorAuth)
  async setMentorLinks(
    @Arg("links", () => SocialLinksInput) links: SocialLinksInput,
    @Ctx() { req }: MyContext
  ): Promise<MentorResponse> {
    // Get mentor
    const mentor = await Mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { error: { message: "Something went wrong, please try again." } };
    }

    // Update links if they exist as arguments
    links.facebook && (mentor.facebook = links.facebook);
    links.instagram && (mentor.instagram = links.instagram);
    links.medium && (mentor.medium = links.medium);
    links.twitter && (mentor.twitter = links.twitter);
    links.linkedin && (mentor.linkedin = links.linkedin);

    const updatedMentor = await Mentor.save(mentor);

    console.log(updatedMentor);

    return { mentor: updatedMentor };
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

  @Query(() => IsProfileCompleteResponse)
  async isProfileComplete(
    @Ctx() { req }: MyContext
  ): Promise<IsProfileCompleteResponse> {
    // get mentor by user id
    const mentor = await Mentor.findOne({
      where: { user: { id: req.session.userId } },
      relations: ["expertises", "workExperience"],
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    let messages: string[] = [];

    if (
      !mentor.title ||
      !mentor.rate ||
      !mentor.location ||
      !mentor.languages
    ) {
      mentor.profileComplete = false;
      messages.push("Update your profile info");
    }

    if (!mentor.bio) {
      mentor.profileComplete = false;
      messages.push("Update your bio");
    }

    if (mentor.expertises.length < 1) {
      mentor.profileComplete = false;
      messages.push("Add your expertise");
    }

    if (mentor.workExperience.length < 1) {
      mentor.profileComplete = false;
      messages.push("Add your work experience");
    }

    if (messages.length > 0) {
      await mentor.save();
      return { messages, isComplete: false };
    }

    mentor.profileComplete = true;
    await mentor.save();

    return { messages, isComplete: true };
  }
}
