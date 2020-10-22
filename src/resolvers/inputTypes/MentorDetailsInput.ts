import { Field, InputType } from "type-graphql";

@InputType()
export class MentorDetailsInput {
  @Field()
  firstName: string;
  @Field()
  lastName: string;
  @Field()
  title: string;
  @Field()
  rate: string;
  @Field()
  location: string;
  @Field()
  languages: string;
}
