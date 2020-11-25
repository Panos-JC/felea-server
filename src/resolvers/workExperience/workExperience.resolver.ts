import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection, getManager, getRepository } from "typeorm";
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
      .getMany();

    return { data: experience };
  }

  // === CREATE WORK EXPERIENCE MUTATION ===
  @Mutation(() => WorkExperience)
  async createWorkExperience(
    @Arg("input") input: WorkExperienceInput,
    @Ctx() { req }: MyContext
  ): Promise<WorkExperience> {
    const transaction = await getManager().transaction(
      async (transactionalEntityManager) => {
        const mentor = await transactionalEntityManager
          .getRepository(Mentor)
          .createQueryBuilder("mentor")
          .where("mentor.user_id = :id", { id: req.session.userId })
          .getOne();

        const workExperienceResult = await transactionalEntityManager
          .getRepository(Industry)
          .createQueryBuilder("industry")
          .where("industry.name_lowercase IN (:...industries)", {
            industries: input.industries,
          })
          .getMany()
          .then(async (industries) => {
            const workExperience = new WorkExperience();
            workExperience.role = input.role;
            workExperience.companyName = input.companyName;
            workExperience.description = input.description;
            workExperience.from = input.from;
            workExperience.untill = input.untill;
            workExperience.mentor = mentor!;
            workExperience.industries = industries;

            return await transactionalEntityManager.save(workExperience);
          });

        return workExperienceResult;
      }
    );

    return transaction;
  }

  // === UPDATE WORK EXPERIENCE MUTATION ===
  @Mutation(() => WorkExperienceResponse)
  @UseMiddleware(isMentorAuth)
  async updateWorkExperience(
    @Arg("id", () => Int) id: number,
    @Arg("input", () => WorkExperienceInput) input: WorkExperienceInput
  ): Promise<WorkExperienceResponse> {
    // Get industries
    const industries = await this.industry
      .createQueryBuilder("industry")
      .where("industry.name_lowercase IN (:...industries)", {
        industries: input.industries,
      })
      .getMany();

    // Get work experience
    const workExperience = await this.experience.findOne(id);

    if (!workExperience) {
      return { errorsMsg: "Work experience not found" };
    }

    workExperience.role = input.role;
    workExperience.companyName = input.companyName;
    workExperience.from = input.from;
    workExperience.untill = input.untill;
    workExperience.description = input.description;
    workExperience.industries = industries;
    this.experience.save(workExperience);

    return { workExperience };
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
