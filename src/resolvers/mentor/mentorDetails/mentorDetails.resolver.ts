import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getRepository } from "typeorm";
import { Mentor } from "../../../entities/Mentor";
import { isMentorAuth } from "../../../middleware/isMentorAuth";
import { MyContext } from "../../../types";
import { MentorDetailsInput, SocialLinksInput } from "./mentorDetails.input";
import { MentorResponse } from "./mentorDetails.response";

@Resolver()
export class MentorDetailsResolver {
  private mentor = getRepository(Mentor);

  @Mutation(() => MentorResponse)
  // @UseMiddleware(isAuth)
  async setMentorDetails(
    @Arg("options", () => MentorDetailsInput) options: MentorDetailsInput,
    @Ctx() { req }: MyContext
  ): Promise<MentorResponse> {
    // get mentor by user id
    const mentor = await this.mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    mentor.firstName = options.firstName;
    mentor.lastName = options.lastName;
    mentor.title = options.title;
    mentor.rate = options.rate;
    mentor.location = options.location;
    mentor.languages = options.languages;
    mentor.availableDayFrom = options.availableDayFrom;
    mentor.availableDayUntill = options.availableDayUntill;
    mentor.availableTimeFrom = options.availableTimeFrom;
    mentor.availableTimeUntill = options.availableTimeUntill;

    await this.mentor.save(mentor);

    return { mentor };
  }

  @Mutation(() => MentorResponse)
  @UseMiddleware(isMentorAuth)
  async setMentorLinks(
    @Arg("links", () => SocialLinksInput) links: SocialLinksInput,
    @Ctx() { req }: MyContext
  ): Promise<MentorResponse> {
    // Get mentor
    const mentor = await this.mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    // Update links if they exist as arguments
    mentor.facebook = links.facebook || "";
    mentor.instagram = links.instagram || "";
    mentor.medium = links.medium || "";
    mentor.twitter = links.twitter || "";
    mentor.linkedin = links.linkedin || "";
    mentor.website = links.website || "";

    await this.mentor.save(mentor);

    console.log(mentor);

    return { mentor };
  }

  @Mutation(() => MentorResponse)
  async setBio(
    @Arg("bio", () => String) bio: string,
    @Ctx() { req }: MyContext
  ): Promise<MentorResponse> {
    // get mentor by user id
    const mentor = await this.mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    mentor.bio = bio;

    await this.mentor.save(mentor);

    return { mentor };
  }

  @Mutation(() => MentorResponse)
  async setMotto(
    @Arg("motto", () => String) motto: string,
    @Ctx() { req }: MyContext
  ): Promise<MentorResponse> {
    // get mentor by user id
    const mentor = await this.mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    mentor.motto = motto;

    await this.mentor.save(mentor);

    return { mentor };
  }
}
