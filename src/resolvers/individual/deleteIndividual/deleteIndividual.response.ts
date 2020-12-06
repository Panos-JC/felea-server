import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class DeleteEntityResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => Boolean)
  deleted?: boolean;
}
