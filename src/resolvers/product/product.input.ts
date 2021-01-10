import { InputType, Field } from "type-graphql";

@InputType()
export class ProductInput {
  @Field()
  title!: string;
  @Field({ nullable: true })
  subtitle?: string;
  @Field()
  image!: string;
  @Field()
  descriptionRichText!: string;
  @Field()
  description!: string;
  @Field()
  price!: number;
}
