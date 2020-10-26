import { Field, InputType } from "type-graphql";

@InputType()
export class SessionInput {
  @Field()
  mentorId: number;
  @Field()
  userId: number;
  @Field()
  date: Date;
}
