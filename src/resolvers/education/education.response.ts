import { Field, ObjectType } from "type-graphql";
import { Education } from "../../entities/Education";

@ObjectType()
export class EducationsResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => [Education], { nullable: true })
  data?: Education[];
}

@ObjectType()
export class EducationResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => Education, { nullable: true })
  education?: Education;
}
