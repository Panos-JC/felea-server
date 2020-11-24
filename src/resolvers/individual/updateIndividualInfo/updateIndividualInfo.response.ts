import { ObjectType, Field } from "type-graphql";
import { Individual } from "../../../entities/Individual";

@ObjectType()
export class UpdateIndividualInfoResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Individual, { nullable: true })
  individual?: Individual;
}
