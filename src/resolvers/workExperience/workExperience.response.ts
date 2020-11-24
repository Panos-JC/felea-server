import { ObjectType, Field } from "type-graphql";
import { WorkExperience } from "../../entities/WorkExperience";

@ObjectType()
export class WorkExperienceResponse {
  @Field(() => String, { nullable: true })
  errorsMsg?: string;

  @Field(() => WorkExperience, { nullable: true })
  workExperience?: WorkExperience;
}
