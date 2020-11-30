import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class GenerateUserResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  emailSent?: boolean;
}
