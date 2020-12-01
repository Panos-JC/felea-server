import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class GetResponse {
  @Field({ nullable: true })
  result?: string;
}
