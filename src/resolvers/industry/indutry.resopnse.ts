import { Field, Int, ObjectType } from "type-graphql";
import { Industry } from "../../entities/Industry";

@ObjectType()
export class IndustriesResponse {
  @Field(() => Int)
  id: number;
  @Field(() => String)
  name: string;
  @Field(() => String)
  name_lowercase: string;
  @Field(() => Int)
  count: number;
}

@ObjectType()
export class EditIndustryResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => Industry, { nullable: true })
  industry?: Industry;
}
