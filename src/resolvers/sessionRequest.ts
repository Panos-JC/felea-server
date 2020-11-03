import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Individual } from "../entities/Individual";
import { Mentor } from "../entities/Mentor";
import { SessionRequest } from "../entities/SessionRequest";
import { isMentorAuth } from "../middleware/isMentorAuth";
import { stripe } from "../stripe";
import { MyContext } from "../types";
import { SessionRequestInput } from "./inputTypes/SessionRequestInput";

@ObjectType()
class CreateRequestResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => SessionRequest, { nullable: true })
  sessionRequest?: SessionRequest;
}

@ObjectType()
class RequestsTypes {
  @Field(() => [SessionRequest])
  pending: SessionRequest[];

  @Field(() => [SessionRequest])
  accepted: SessionRequest[];

  @Field(() => [SessionRequest])
  declined: SessionRequest[];
}

@ObjectType()
class RequestsByMentorResponse {
  @Field(() => RequestsTypes, { nullable: true })
  requests?: RequestsTypes;

  @Field(() => String, { nullable: true })
  errorMsg?: string;
}

@ObjectType()
class RequestActionResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Boolean, { nullable: true })
  accepted?: boolean;

  @Field(() => Boolean, { nullable: true })
  declined?: boolean;
}

@Resolver()
export class SessionRequestResolver {
  @Mutation(() => CreateRequestResponse)
  async createSessionRequest(
    @Arg("input", () => SessionRequestInput) input: SessionRequestInput,
    @Ctx() { req }: MyContext
  ): Promise<CreateRequestResponse> {
    // Get individual from session
    const individual = await Individual.findOne({
      where: { user: { id: req.session.userId } },
      relations: ["user"],
    });

    if (!individual) {
      return { errorMsg: "User not found" };
    }

    // Get mentor
    const mentor = await Mentor.findOne(input.mentorId);

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    try {
      let customerId;
      if (individual.stripeCustomerId) {
        customerId = individual.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: individual.user.email,
          name: `${individual.firstName} ${individual.lastName}`,
          payment_method: input.token,
        });
        customerId = customer.id;
        individual.stripeCustomerId = customerId;
        await individual.save();
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: input.ammount,
        currency: "eur",
        customer: customerId,
        capture_method: "manual",
        payment_method: input.token,
      });

      // Confirm payment intent. Payment intent's status changes to 'requires_capture'
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
        paymentIntent.id
      );

      const sessionRequest = new SessionRequest();
      sessionRequest.individual = individual;
      sessionRequest.mentor = mentor;
      sessionRequest.objective = input.objective;
      sessionRequest.headline = input.headline;
      sessionRequest.email = input.email;
      sessionRequest.communicationTool = input.communicationTool;
      sessionRequest.communicationToolId = input.communicationToolId;
      sessionRequest.message = input.message;
      sessionRequest.ammount = input.ammount;
      sessionRequest.stripePaymentIntentId = confirmedPaymentIntent.id;
      await sessionRequest.save();

      console.log(individual);

      return { sessionRequest };
    } catch (error) {
      console.log(error);
      return { errorMsg: "something went wrong" };
    }
  }

  @Query(() => RequestsByMentorResponse)
  async requestsByMentor(
    @Ctx() { req }: MyContext
  ): Promise<RequestsByMentorResponse> {
    const pending = await getConnection()
      .getRepository(SessionRequest)
      .createQueryBuilder("sessionRequest")
      .innerJoinAndSelect("sessionRequest.mentor", "mentor")
      .innerJoinAndSelect("sessionRequest.individual", "individual")
      .innerJoinAndSelect("individual.user", "individualUser")
      .innerJoinAndSelect("mentor.user", "mentorUser")
      .where("mentorUser.id = :id", { id: req.session.userId })
      .andWhere("sessionRequest.status = 'pending'")
      .getMany();

    const accepted = await getConnection()
      .getRepository(SessionRequest)
      .createQueryBuilder("sessionRequest")
      .innerJoinAndSelect("sessionRequest.mentor", "mentor")
      .innerJoinAndSelect("sessionRequest.individual", "individual")
      .innerJoinAndSelect("individual.user", "individualUser")
      .innerJoinAndSelect("mentor.user", "mentorUser")
      .where("mentorUser.id = :id", { id: req.session.userId })
      .andWhere("sessionRequest.status = 'accepted'")
      .getMany();

    const declined = await getConnection()
      .getRepository(SessionRequest)
      .createQueryBuilder("sessionRequest")
      .innerJoinAndSelect("sessionRequest.mentor", "mentor")
      .innerJoinAndSelect("sessionRequest.individual", "individual")
      .innerJoinAndSelect("individual.user", "individualUser")
      .innerJoinAndSelect("mentor.user", "mentorUser")
      .where("mentorUser.id = :id", { id: req.session.userId })
      .andWhere("sessionRequest.status = 'declined'")
      .getMany();

    if (!pending || !accepted || !declined) {
      return { errorMsg: "Something went wrong" };
    }

    return { requests: { accepted, pending, declined } };
  }

  @Mutation(() => RequestActionResponse)
  @UseMiddleware(isMentorAuth)
  async acceptRequest(
    @Arg("requestId", () => Int) requestId: number
  ): Promise<RequestActionResponse> {
    const request = await SessionRequest.findOne(requestId);

    if (!request) {
      return { errorMsg: "Request not found" };
    }

    try {
      const paymentIntent = await stripe.paymentIntents.capture(
        request.stripePaymentIntentId
      );

      request.status = "accepted";
      await request.save();

      return { accepted: true };
    } catch (error) {
      console.log(error.code);
      return { errorMsg: "Something went wrong" };
    }
  }

  @Mutation(() => RequestActionResponse)
  @UseMiddleware(isMentorAuth)
  async declineRequest(
    @Arg("requestId", () => Int) requestId: number
  ): Promise<RequestActionResponse> {
    const request = await SessionRequest.findOne(requestId);

    if (!request) {
      return { errorMsg: "Request not found" };
    }

    try {
      const paymentIntent = await stripe.paymentIntents.cancel(
        request.stripePaymentIntentId
      );

      request.status = "declined";
      await request.save();

      return { declined: true };
    } catch (error) {
      console.log(error.code);
      return { errorMsg: "Something went wrong" };
    }
  }
}
