import { InputType, Field } from "type-graphql";

@InputType()
export class CreateCompanyInput {
  @Field(() => String)
  name: string;

  @Field(() => Number)
  accounts: number;
}
