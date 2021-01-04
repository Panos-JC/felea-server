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
import { Industry } from "../../entities/Industry";
import { Mentor } from "../../entities/Mentor";
import { WorkExperience } from "../../entities/WorkExperience";
import { isMentorAuth } from "../../middleware/isMentorAuth";
import { MyContext } from "../../types";
import { WorkExperienceInput } from "./workExperience.input";
import {
  WorkExperienceResponse,
  WorkExperiencesResponse,
} from "./workExperience.response";

@Resolver()
export class WorkExperienceResolver {
  private experience = getRepository(WorkExperience);
  private industry = getRepository(Industry);
  private mentor = getRepository(Mentor);

  // === GET WORK EXPERIENCES QUERY ===
  @Query(() => WorkExperiencesResponse)
  async workExperiences(
    @Ctx() { req }: MyContext,
    @Arg("mentorId", () => Int, { nullable: true }) mentorId?: number
  ): Promise<WorkExperiencesResponse> {
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

    const experience = await this.experience
      .createQueryBuilder("experience")
      .innerJoinAndSelect("experience.industries", "industry")
      .where("experience.mentor_id = :mentorId", { mentorId: mentor.id })
      .orderBy("experience.from", "DESC")
      .getMany();

    return { data: experience };
  }

  // === CREATE WORK EXPERIENCE MUTATION ===
  @Mutation(() => WorkExperienceResponse)
  async createWorkExperience(
    @Arg("input") input: WorkExperienceInput,
    @Ctx() { req }: MyContext
  ): Promise<WorkExperienceResponse> {
    const mentor = await this.mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { error: { field: "General", message: "User not found" } };
    }

    const experience = new WorkExperience();
    experience.mentor = mentor;
    experience.role = input.role;
    experience.companyName = input.companyName;
    experience.from = input.from;
    experience.untill = input.untill;
    experience.present = input.present;
    experience.description = input.description;
    experience.industries = [];

    // create industries if they dont exist
    for (const ind of input.industries) {
      const industry = await this.industry.findOne({
        where: { nameLowercase: ind.toLowerCase() },
      });

      if (industry) {
        experience.industries = [...experience.industries, industry];
      } else {
        const newIndustryDto = new Industry();
        newIndustryDto.name = ind;
        newIndustryDto.nameLowercase = ind.toLowerCase();

        const newIndustry = await this.industry.save(newIndustryDto);
        experience.industries = [...experience.industries, newIndustry];
      }
    }

    // save new work experience
    const newExperience = await this.experience.save(experience);

    return { workExperience: newExperience };
  }

  // === UPDATE WORK EXPERIENCE MUTATION ===
  @Mutation(() => WorkExperienceResponse)
  @UseMiddleware(isMentorAuth)
  async updateWorkExperience(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => WorkExperienceInput) input: WorkExperienceInput
  ): Promise<WorkExperienceResponse> {
    // Get work experience
    const workExperience = await this.experience.findOne(id);

    if (!workExperience) {
      return {
        error: { field: "general", message: "Work experience not found" },
      };
    }

    workExperience.role = input.role;
    workExperience.companyName = input.companyName;
    workExperience.from = input.from;
    workExperience.untill = input.untill;
    workExperience.present = input.present;
    workExperience.description = input.description;
    workExperience.industries = [];

    // create industries if they dont exist
    for (const ind of input.industries) {
      const industry = await this.industry.findOne({
        where: { nameLowercase: ind.toLowerCase() },
      });

      if (industry) {
        workExperience.industries = [...workExperience.industries, industry];
      } else {
        const newIndustry = new Industry();
        newIndustry.name = ind;
        newIndustry.nameLowercase = ind.toLowerCase();

        const savedIndustry = await this.industry.save(newIndustry);
        workExperience.industries = [
          ...workExperience.industries,
          savedIndustry,
        ];
      }
    }

    const updatedExperience = await this.experience.save(workExperience);

    return { workExperience: updatedExperience };
  }

  // === DELETE WORK EXPERIENCE MUTATION ===
  @Mutation(() => Boolean)
  @UseMiddleware(isMentorAuth)
  async deleteWorkExperience(
    @Arg("id", () => Int) id: number
  ): Promise<Boolean> {
    // Get work experience
    const workExperience = await this.experience.findOne(id);

    if (!workExperience) {
      return false;
    }

    await this.experience.remove(workExperience);

    return true;
  }
}
