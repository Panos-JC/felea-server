import { ObjectType, Field } from "type-graphql";
import { WorkExperience } from "../../entities/WorkExperience";
import { FieldError } from "../shared/ObjectTypes";

@ObjectType()
export class WorkExperiencesResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => [WorkExperience], { nullable: true })
  data?: WorkExperience[];
}

@ObjectType()
export class WorkExperienceResponse {
  @Field(() => FieldError, { nullable: true })
  error?: FieldError;

  @Field(() => WorkExperience, { nullable: true })
  workExperience?: WorkExperience;
}
