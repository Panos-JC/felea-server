import { InputType, Field } from "type-graphql";

@InputType()
export class EducationInput {
  @Field()
  title: string;
  @Field()
  school: string;
  @Field()
  from: Date;
  @Field()
  untill: Date;
  @Field()
  description: string;
}
