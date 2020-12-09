import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Education } from "../../entities/Education";
import { Mentor } from "../../entities/Mentor";
import { isMentorAuth } from "../../middleware/isMentorAuth";
import { MyContext } from "../../types";
import { EducationInput } from "./education.input";
import { EducationResponse, EducationsResponse } from "./education.response";

@Resolver()
export class EducationResolver {
  private mentor = getRepository(Mentor);
  private education = getRepository(Education);

  @Query(() => EducationsResponse)
  async educations(
    @Ctx() { req }: MyContext,
    @Arg("mentorId", () => Int, { nullable: true }) mentorId?: number
  ): Promise<EducationsResponse> {
    let mentor;
    if (mentorId) {
      mentor = await this.mentor.findOne(mentorId);
    } else {
      mentor = await this.mentor.findOne({
        where: { user: { id: req.session.userId } },
      });
    }

    if (!mentor) {
      return { errorMsg: "User not found" };
    }

    const educations = await this.education
      .createQueryBuilder("education")
      .where('education."mentorId" = :mentorId', { mentorId: mentor.id })
      .orderBy('education."endDate"', "DESC")
      .getMany();

    return { data: educations };
  }

  @Mutation(() => EducationResponse)
  async createEducation(
    @Arg("input", () => EducationInput) input: EducationInput,
    @Ctx() { req }: MyContext
  ): Promise<EducationResponse> {
    const mentor = await this.mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    const education = new Education();

    education.title = input.title;
    education.school = input.school;
    education.startDate = new Date(input.from);
    education.endDate = new Date(input.untill);
    education.description = input.description;
    education.mentor = mentor;
    await this.education.save(education);

    return { education };
  }

  @Mutation(() => EducationResponse)
  @UseMiddleware(isMentorAuth)
  async updateEducation(
    @Arg("input", () => EducationInput) input: EducationInput,
    @Arg("id", () => Int) id: number
  ): Promise<EducationResponse> {
    const education = await this.education.findOne(id);

    if (!education) {
      return { errorMsg: "Education not found" };
    }

    education.title = input.title;
    education.school = input.school;
    education.startDate = input.from;
    education.endDate = input.untill;
    education.description = input.description;
    await this.education.save(education);

    return { education };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isMentorAuth)
  async deleteEducation(@Arg("id", () => Int) id: number): Promise<boolean> {
    const education = await this.education.findOne(id);

    if (!education) {
      return false;
    }

    await this.education.remove(education);

    return true;
  }
}
