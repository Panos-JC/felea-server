import { Field, ObjectType } from "type-graphql";
import { Users } from "../../../entities/Users";

@ObjectType()
export class AvatarResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => Users, { nullable: true })
  user?: Users;
}
