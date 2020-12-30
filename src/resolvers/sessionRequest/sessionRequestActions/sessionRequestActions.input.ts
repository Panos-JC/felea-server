import { Field, InputType } from "type-graphql";

@InputType()
export class SessionRequestInput {
  @Field()
  objective: string;
  @Field()
  headline: string;
  @Field()
  email: string;
  @Field()
  communicationTool: string;
  @Field()
  communicationToolId: string;
  @Field()
  suggestedDate1: Date;
  @Field()
  suggestedDate2: Date;
  @Field()
  suggestedDate3: Date;
  @Field()
  message: string;
  @Field()
  ammount: number;
  @Field()
  mentorId: number;
}
