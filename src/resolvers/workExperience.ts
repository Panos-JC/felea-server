import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { getConnection, getManager } from "typeorm";
import { Industry } from "../entities/Industry";
import { Mentor } from "../entities/Mentor";
import { WorkExperience } from "../entities/WorkExperience";
import { MyContext } from "../types";

@InputType()
class WorkExperienceInput {
  @Field()
  role: string;
  @Field()
  companyName: string;
  @Field()
  description: string;
  @Field()
  from: string;
  @Field()
  untill: string;
  @Field(() => [String])
  industries: string[];
}

@Resolver()
export class WorkExperienceResolver {
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
    // get industries
    // create workExp
    // create workExpInd

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
            console.log(industries);
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
}
