import {
  Arg,
  Ctx,
  Field,
  Int,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Mentor } from "../../entities/Mentor";
import { SessionRequest } from "../../entities/SessionRequest";
import { MyContext } from "../../types";
import { MentorResponse } from "./mentorDetails/mentorDetails.response";

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
  async allMentors(): Promise<MentorsResponse[]> {
    const mentors = await Mentor.find({ relations: ["user"] });

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

    return result;
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

  @Query(() => IsProfileCompleteResponse)
  async isProfileComplete(
    @Ctx() { req }: MyContext
  ): Promise<IsProfileCompleteResponse> {
    // get mentor by user id
    const mentor = await Mentor.findOne({
      where: { user: { id: req.session.userId } },
      relations: ["expertises", "user"],
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    let messages: string[] = [];

    if (
      !mentor.title ||
      !mentor.rate ||
      !mentor.country ||
      mentor.city ||
      !mentor.languages
    ) {
      mentor.profileComplete = false;
      messages.push("Update your profile info");
    }

    if (!mentor.bio) {
      mentor.profileComplete = false;
      messages.push("Update your bio");
    }

    if (!mentor.motto) {
      mentor.profileComplete = false;
      messages.push("Update your motto");
    }

    if (!mentor.user.avatar) {
      mentor.profileComplete = false;
      messages.push("Upload an Avatar");
    }

    if (mentor.expertises.length < 1) {
      mentor.profileComplete = false;
      messages.push("Add your skills");
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
