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
  message: string;
  @Field()
  ammount: number;
  @Field()
  mentorId: number;
  @Field()
  token: string;
}
