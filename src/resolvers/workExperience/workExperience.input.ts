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
  @Field({ nullable: true })
  untill?: Date;
  @Field()
  present: boolean;
  @Field(() => [String])
  industries: string[];
}
