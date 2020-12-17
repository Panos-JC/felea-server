import { Field, Int, ObjectType } from "type-graphql";
import { Skill } from "../../entities/Skill";

@ObjectType()
export class SkillsResponse {
  @Field(() => Int)
  skill_id: number;
  @Field(() => String)
  skill_name: string;
  @Field(() => String)
  skill_nameLowercase: string;
  @Field(() => Int)
  count: number;
}

@ObjectType()
export class EditSkillResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => Skill, { nullable: true })
  skill?: Skill;
}

@ObjectType()
export class DeleteSkillResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => Boolean, { nullable: true })
  deleted?: boolean;
}
