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
import { Admin } from "../entities/Admin";
import { Individual } from "../entities/Individual";
import { Mentor } from "../entities/Mentor";
import { Session } from "../entities/Session";
import { isAdminAuth } from "../middleware/isAdminAuth";
import { isMentorAuth } from "../middleware/isMentorAuth";
import { MyContext } from "../types";
import { SessionInput } from "./inputTypes/SessionInput";

@ObjectType()
class SessionError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class SessionResponse {
  @Field(() => SessionError, { nullable: true })
  error?: SessionError;

  @Field(() => Session, { nullable: true })
  session?: Session;
}

@Resolver()
export class SessionResolver {
  @Mutation(() => SessionResponse)
  @UseMiddleware(isAdminAuth)
  async createSession(
    @Arg("input", () => SessionInput) input: SessionInput,
    @Ctx() { req }: MyContext
  ): Promise<SessionResponse> {
    // get mentor
    const mentor = await Mentor.findOne({ id: input.mentorId });

    if (!mentor) {
      return { error: { field: "mentor", message: "Mentor was not found" } };
    }

    // get individual
    const individual = await Individual.findOne({ id: input.userId });

    if (!individual) {
      return { error: { field: "user", message: "User was not found" } };
    }

    // get admin
    const admin = await Admin.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!admin) {
      return { error: { field: "general", message: "Admin was not found" } };
    }

    const session = new Session();
    session.mentor = mentor;
    session.individual = individual;
    session.creator = admin;
    session.date = input.date;

    const createdSession = await Session.save(session);

    return { session: createdSession };
  }

  @Query(() => [Session])
  async sessions() {
    return await Session.find({
      relations: [
        "creator",
        "creator.user",
        "individual",
        "individual.user",
        "mentor",
        "mentor.user",
      ],
      order: {
        date: "DESC",
      },
    });
  }

  @Query(() => [Session])
  @UseMiddleware(isMentorAuth)
  async mentorSessions(@Ctx() { req }: MyContext) {
    const mentor = await Mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      console.log("NO MENTOR");
      return "no mentor";
    }

    const sessions = await Session.find({
      where: { mentor: { id: mentor.id } },
      join: {
        alias: "session",
        innerJoinAndSelect: {
          mentor: "session.mentor",
          individual: "session.individual",
        },
      },
    });

    console.log(sessions);
    return sessions;
  }
}
