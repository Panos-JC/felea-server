import { ObjectType, Field } from "type-graphql";
import { Users } from "../../../entities/Users";
import { FieldError } from "../../shared/ObjectTypes";

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Users, { nullable: true })
  user?: Users;
}
