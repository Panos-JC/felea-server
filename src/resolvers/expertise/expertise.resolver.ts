import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection, getRepository } from "typeorm";
import { Expertise } from "../../entities/Expertise";
import { Mentor } from "../../entities/Mentor";
import { Skill } from "../../entities/Skill";
import { isMentorAuth } from "../../middleware/isMentorAuth";
import { MyContext } from "../../types";
import { DeleteResponse, ExpertiseResponse } from "./expertise.response";

@Resolver()
export class ExpertiseResolver {
  private expertise = getRepository(Expertise);
  private skill = getRepository(Skill);
  private mentor = getRepository(Mentor);

  @Mutation(() => ExpertiseResponse)
  @UseMiddleware(isMentorAuth)
  async createExpertise(
    @Ctx() { req }: MyContext,
    @Arg("skillName", () => String) skillName: string,
    @Arg("description", () => String, { nullable: true }) description?: string,
    @Arg("descriptionText", () => String, { nullable: true })
    descriptionText?: string
  ): Promise<ExpertiseResponse> {
    if (!skillName.replace(/\s+/g, "")) {
      return {
        error: { field: "skill", message: "This field must not be empty" },
      };
    }

    // Get mentor from session
    const mentor = await this.mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { error: { field: "general", message: "Mentor not found" } };
    }

    const expertise = new Expertise();
    expertise.mentor = mentor;
    expertise.description = description;
    expertise.descriptionText = descriptionText;

    const skill = await this.skill.findOne({
      where: { nameLowercase: skillName.toLowerCase() },
    });

    // Create skill if it does not exist
    if (!skill) {
      const newSkill = new Skill();
      newSkill.name = skillName;
      newSkill.nameLowercase = skillName.toLowerCase();

      await this.skill.save(newSkill);

      expertise.skill = newSkill;
    } else {
      expertise.skill = skill;
    }

    await this.expertise.save(expertise);

    return { expertise };
  }

  @Query(() => [Expertise])
  @UseMiddleware(isMentorAuth)
  async expertises(@Ctx() { req }: MyContext): Promise<Expertise[]> {
    const mentor = await Mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) throw "Mentor not found";

    const expertises = await Expertise.find({
      where: { mentor: { id: mentor.id } },
      relations: ["skill"],
    });

    console.log(expertises);
    return expertises;
  }

  @Query(() => [Expertise])
  async expertisesById(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<Expertise[]> {
    const expertises = await Expertise.find({
      where: { mentor: { id: mentorId } },
      // relations: ["skill", "mentor"],
      relations: ["skill"],
    });
    console.log(expertises);
    return expertises;
  }

  @Mutation(() => DeleteResponse)
  async deleteExpertise(
    @Arg("id", () => Int) id: number
  ): Promise<DeleteResponse> {
    const result = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Expertise)
      .where("id = :id", { id })
      .execute();

    if (result) {
      return { deleted: true };
    } else {
      return { errorMsg: "Something happened" };
    }
  }
}
