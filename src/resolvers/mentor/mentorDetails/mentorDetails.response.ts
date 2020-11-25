import { Field, ObjectType } from "type-graphql";
import { Mentor } from "../../../entities/Mentor";

@ObjectType()
export class MentorResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Mentor, { nullable: true })
  mentor?: Mentor;
}
