import { Field, InputType } from "type-graphql";

@InputType()
export class CertificateInput {
  @Field()
  title!: string;
  @Field()
  organization!: string;
  @Field()
  date!: Date;
  @Field()
  description!: string;
}
