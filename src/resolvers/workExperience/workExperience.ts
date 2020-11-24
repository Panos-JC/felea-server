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
import { WorkExperienceResponse } from "./workExperience.response";

@Resolver()
export class WorkExperienceResolver {
  private workExperience = getRepository(WorkExperience);
  private industry = getRepository(Industry);

  // === GET WORK EXPERIENCES QUERY ===
  @Query(() => [WorkExperience])
  async workExperiences(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<WorkExperience[]> {
    const result = await getConnection()
      .getRepository(WorkExperience)
      .createQueryBuilder("we")
      .innerJoinAndSelect("we.industries", "industry")
      .where("we.mentor_id = :mentorId", { mentorId })
      .getMany();

    console.log("result ", result);
    return result;
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
    const workExperience = await this.workExperience.findOne(id);

    if (!workExperience) {
      return { errorsMsg: "Work experience not found" };
    }

    workExperience.role = input.role;
    workExperience.companyName = input.companyName;
    workExperience.from = input.from;
    workExperience.untill = input.untill;
    workExperience.description = input.description;
    workExperience.industries = industries;
    this.workExperience.save(workExperience);

    return { workExperience };
  }

  // === DELETE WORK EXPERIENCE MUTATION ===
  @Mutation(() => Boolean)
  @UseMiddleware(isMentorAuth)
  async deleteWorkExperience(
    @Arg("id", () => Int) id: number
  ): Promise<Boolean> {
    // Get work experience
    const workExperience = await this.workExperience.findOne(id);

    if (!workExperience) {
      return false;
    }

    await this.workExperience.remove(workExperience);

    return true;
  }
}
