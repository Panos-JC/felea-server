import { InputType, Field } from "type-graphql";

@InputType()
export class EducationInput {
  @Field()
  title: string;
  @Field()
  school: string;
  @Field()
  from: string;
  @Field()
  untill: string;
  @Field()
  description: string;
}
