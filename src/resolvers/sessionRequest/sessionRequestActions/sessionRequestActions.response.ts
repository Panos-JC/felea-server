import { ObjectType, Field } from "type-graphql";
import { SessionRequest } from "../../../entities/SessionRequest";

@ObjectType()
export class RequestActionResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  accepted?: boolean;

  @Field(() => Boolean, { nullable: true })
  declined?: boolean;
}

@ObjectType()
export class SetRequestCompleteResponse {
  @Field(() => Boolean, { nullable: true })
  complete?: boolean;

  @Field(() => String, { nullable: true })
  errorMsg?: string;
}

@ObjectType()
export class CreateRequestResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => SessionRequest, { nullable: true })
  sessionRequest?: SessionRequest;
}

@ObjectType()
export class DeleteRequestResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  deleted?: boolean;
}

@ObjectType()
export class CancelRequestResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  canceled?: boolean;
}
