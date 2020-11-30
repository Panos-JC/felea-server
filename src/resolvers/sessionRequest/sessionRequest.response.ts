import { Field, ObjectType } from "type-graphql";
import { Individual } from "../../entities/Individual";
import { Mentor } from "../../entities/Mentor";
import { SessionRequest } from "../../entities/SessionRequest";

@ObjectType()
class RequestsTypes {
  @Field(() => [SessionRequest])
  pending: SessionRequest[];

  @Field(() => [SessionRequest])
  accepted: SessionRequest[];

  @Field(() => [SessionRequest])
  declined: SessionRequest[];

  @Field(() => [SessionRequest])
  completed: SessionRequest[];
}

@ObjectType()
export class SessionRequestByIdData {
  @Field(() => Individual)
  individual: Individual;

  @Field(() => Mentor)
  mentor: Mentor;

  @Field(() => Number)
  ammount: number;

  @Field(() => String)
  status: string;

  @Field(() => Date)
  date: Date;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class RequestsByMentorResponse {
  @Field(() => RequestsTypes, { nullable: true })
  requests?: RequestsTypes;

  @Field(() => String, { nullable: true })
  errorMsg?: string;
}

@ObjectType()
export class SessionRequestByIdResponse {
  @Field(() => SessionRequestByIdData, { nullable: true })
  data?: SessionRequestByIdData;

  @Field(() => String, { nullable: true })
  errorMsg?: string;
}

@ObjectType()
export class SessionRequestsResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => [SessionRequest], { nullable: true })
  data?: SessionRequest[];
}

@ObjectType()
export class SessionRequestResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => SessionRequest, { nullable: true })
  data?: SessionRequest;
}
