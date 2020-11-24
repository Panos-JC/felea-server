import { ObjectType, Field } from "type-graphql";
import { Admin } from "../../../entities/Admin";

@ObjectType()
export class UpdateAdminInfoResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Admin, { nullable: true })
  admin?: Admin;
}
