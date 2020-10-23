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
  async expertises(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<Expertise[]> {
    const expertises = await Expertise.find({
      where: { mentor: { id: mentorId } },
      relations: ["skill", "mentor"],
    });
    console.log(expertises);
    return expertises;
  }
}
