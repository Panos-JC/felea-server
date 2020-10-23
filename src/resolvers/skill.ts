import { Query, Resolver } from "type-graphql";
import { Skill } from "../entities/Skill";

@Resolver()
export class SkillResolver {
  @Query(() => [Skill])
  async skills(): Promise<Skill[]> {
    return await Skill.find({});
  }
}
