import { ObjectType, Field } from "type-graphql";
import { Product } from "../../entities/Product";
import { FieldError } from "../shared/ObjectTypes";

@ObjectType()
export class CreateProductResponse {
  @Field(() => FieldError, { nullable: true })
  error?: FieldError;

  @Field(() => Product, { nullable: true })
  product?: Product;
}

@ObjectType()
export class DeleteProductResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  deleted?: boolean;
}
