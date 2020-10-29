import e from "express";
import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Expertise } from "../entities/Expertise";
import { Mentor } from "../entities/Mentor";
import { Skill } from "../entities/Skill";
import { isMentorAuth } from "../middleware/isMentorAuth";
import { MyContext } from "../types";

@ObjectType()
class ExpertiseResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Expertise, { nullable: true })
  expertise?: Expertise;
}

@ObjectType()
class DeleteResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  deleted?: boolean;
}

@Resolver()
export class ExpertiseResolver {
  @Mutation(() => ExpertiseResponse)
  @UseMiddleware(isMentorAuth)
  async createExpertise(
    @Arg("skillId", () => Int) skillId: number,
    @Arg("description") description: string,
    @Ctx() { req }: MyContext
  ): Promise<ExpertiseResponse> {
    const skill = await Skill.findOne(skillId);

    if (!skill) {
      return { errorMsg: "No skill found" };
    }
    const mentor = await Mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { errorMsg: "No mentor found" };
    }

    const expertise = new Expertise();
    expertise.mentor = mentor;
    expertise.skill = skill;
    expertise.description = description;

    const createdExpertise = await Expertise.save(expertise);

    return { expertise: createdExpertise };
  }

  @Query(() => [Expertise])
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
      relations: ["skill", "mentor"],
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
