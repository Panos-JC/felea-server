import { ObjectType, Field } from "type-graphql";
import { Company } from "../../entities/Company";
import { Individual } from "../../entities/Individual";

@ObjectType()
export class CompanyResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Company, { nullable: true })
  company?: Company;
}

@ObjectType()
export class DeleteCompanyResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  deleted?: boolean;
}

@ObjectType()
export class EmployeesResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => [Individual], { nullable: true })
  data?: Individual[];
}
