import { Field, InputType } from "type-graphql";

@InputType()
export class RegisterInput {
  @Field()
  firstName: string;
  @Field()
  lastName: string;
  @Field()
  email: string;
  @Field()
  password: string;
  @Field()
  repeatPassword: string;
}

@InputType()
export class IndividualRegisterInput {
  @Field()
  firstName: string;
  @Field()
  lastName: string;
  @Field()
  email: string;
  @Field()
  password: string;
  @Field()
  repeatPassword: string;
  @Field()
  code: string;
}
