import { Field, InputType } from "type-graphql";

@InputType()
export class ReviewInput {
  @Field()
  message: string;
  @Field()
  rating: number;
  @Field()
  mentorId: number;
}
