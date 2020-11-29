import { ObjectType, Field } from "type-graphql";
import { Expertise } from "../../entities/Expertise";
import { FieldError } from "../users/register/register.response";

@ObjectType()
export class ExpertiseResponse {
  @Field(() => FieldError, { nullable: true })
  error?: FieldError;

  @Field(() => Expertise, { nullable: true })
  expertise?: Expertise;
}

@ObjectType()
export class DeleteResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  deleted?: boolean;
}
