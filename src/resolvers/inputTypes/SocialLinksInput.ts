import { Field, InputType } from "type-graphql";

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
