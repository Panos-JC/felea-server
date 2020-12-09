import { ObjectType, Field } from "type-graphql";
import { Company } from "../../entities/Company";

@ObjectType()
export class CreateCompanyResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Company, { nullable: true })
  company?: Company;
}
