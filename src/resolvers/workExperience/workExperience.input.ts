import { InputType, Field } from "type-graphql";

@InputType()
export class WorkExperienceInput {
  @Field()
  role: string;
  @Field()
  companyName: string;
  @Field()
  description: string;
  @Field()
  from: Date;
  @Field()
  untill: Date;
  @Field(() => [String])
  industries: string[];
}
