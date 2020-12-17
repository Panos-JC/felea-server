import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Skill } from "../../entities/Skill";
import {
  DeleteSkillResponse,
  EditSkillResponse,
  SkillsResponse,
} from "./skill.response";

@Resolver()
export class SkillResolver {
  private skillRepository = getRepository(Skill);

  @Query(() => [SkillsResponse])
  async skills(): Promise<SkillsResponse[]> {
    const skills = await this.skillRepository
      .createQueryBuilder("skill")
      .select([
        "skill.id",
        "skill.name",
        "skill.nameLowercase",
        "count(expertise.skill_id)",
      ])
      .leftJoin("skill.expertise", "expertise")
      .groupBy("skill.id")
      .orderBy("count", "DESC")
      .getRawMany();

    return skills;
  }

  @Mutation(() => EditSkillResponse)
  async editSkill(
    @Arg("skillId", () => Int) skillId: number,
    @Arg("newName", () => String) newName: string
  ): Promise<EditSkillResponse> {
    const skill = await this.skillRepository.findOne(skillId);

    if (!skill) {
      return { errorMsg: "Skill not found" };
    }

    if (newName.toLowerCase() === skill.nameLowercase) {
      skill.name = newName;
    } else {
      return { errorMsg: "Name does not match lowercase." };
    }

    const savedSkill = await this.skillRepository.save(skill);

    return { skill: savedSkill };
  }

  @Mutation(() => DeleteSkillResponse)
  async deleteSkill(
    @Arg("skillId", () => Int) skillId: number
  ): Promise<DeleteSkillResponse> {
    const skill = await this.skillRepository.findOne(skillId);

    if (!skill) {
      return { errorMsg: "Skill not found" };
    }

    try {
      await this.skillRepository.remove(skill);
      return { deleted: true };
    } catch (error) {
      console.log(error);
      if (error.code === "23503") {
        return { errorMsg: "This skill is in use", deleted: false };
      }
      return { deleted: false };
    }
  }
}
