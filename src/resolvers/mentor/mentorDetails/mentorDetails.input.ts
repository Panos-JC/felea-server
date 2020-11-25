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

@InputType()
export class SocialLinksInput {
  @Field()
  medium?: string;
  @Field()
  linkedin?: string;
  @Field()
  facebook?: string;
  @Field()
  twitter?: string;
  @Field()
  instagram?: string;
}
