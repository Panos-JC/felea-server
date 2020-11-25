import { Field, ObjectType } from "type-graphql";
import { Certificate } from "../../entities/Certificate";

@ObjectType()
export class CertificatesResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => [Certificate], { nullable: true })
  data?: Certificate[];
}

@ObjectType()
export class CertificateResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => Certificate, { nullable: true })
  certificate?: Certificate;
}
