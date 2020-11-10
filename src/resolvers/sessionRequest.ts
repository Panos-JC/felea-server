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
import { isAdminAuth } from "../middleware/isAdminAuth";
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

  @Field(() => [SessionRequest])
  completed: SessionRequest[];
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

@ObjectType()
class SessionRequestByIdData {
  @Field(() => Individual)
  individual: Individual;

  @Field(() => Mentor)
  mentor: Mentor;

  @Field(() => Number)
  ammount: number;

  @Field(() => String)
  status: string;

  @Field(() => String)
  paymentStatus: string;

  @Field(() => Date)
  date: Date;

  @Field(() => String)
  message: string;
}

@ObjectType()
class SessionRequestByIdResponse {
  @Field(() => SessionRequestByIdData, { nullable: true })
  data?: SessionRequestByIdData;

  @Field(() => String, { nullable: true })
  errorMsg?: string;
}

@ObjectType()
class SetRequestCompleteResponse {
  @Field(() => Boolean, { nullable: true })
  complete?: boolean;

  @Field(() => String, { nullable: true })
  errorMsg?: string;
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

      if (!individual.stripePaymentMethodId) {
        individual.stripePaymentMethodId = input.token;
        await individual.save();
      }

      // Create payment intent
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

    const completed = await getConnection()
      .getRepository(SessionRequest)
      .createQueryBuilder("sessionRequest")
      .innerJoinAndSelect("sessionRequest.mentor", "mentor")
      .innerJoinAndSelect("sessionRequest.individual", "individual")
      .innerJoinAndSelect("individual.user", "individualUser")
      .innerJoinAndSelect("mentor.user", "mentorUser")
      .where("mentorUser.id = :id", { id: req.session.userId })
      .andWhere("sessionRequest.status = 'complete'")
      .getMany();

    if (!pending || !accepted || !declined || !completed) {
      return { errorMsg: "Something went wrong" };
    }

    return { requests: { accepted, pending, declined, completed } };
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
      // Capture payment
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
      // Cancel payment
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

  @Query(() => [SessionRequest])
  @UseMiddleware(isAdminAuth)
  async sessionRequests() {
    const requests = getConnection()
      .getRepository(SessionRequest)
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.mentor", "mentor")
      .innerJoinAndSelect("mentor.user", "mentorUser")
      .innerJoinAndSelect("session.individual", "individual")
      .innerJoinAndSelect("individual.user", "individualUser")
      .orderBy("session.createdAt", "DESC")
      .getMany();

    const test = await stripe.paymentIntents.retrieve(
      "pi_1HjQWaGUOvv7bpMIv4x3oZUJ"
    );

    console.log(test.status);

    return requests;
  }

  @Query(() => SessionRequestByIdResponse)
  @UseMiddleware(isAdminAuth)
  async sessionRequestById(
    @Arg("requestId", () => Int) requestId: number
  ): Promise<SessionRequestByIdResponse> {
    const request = await SessionRequest.findOne({
      where: { id: requestId },
      relations: ["mentor", "individual", "mentor.user", "individual.user"],
    });

    if (!request) {
      return { errorMsg: "Request not found" };
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      request.stripePaymentIntentId
    );

    if (!paymentIntent) {
      return { errorMsg: "Stripe error" };
    }

    const data: SessionRequestByIdData = {
      individual: request.individual,
      mentor: request.mentor,
      ammount: request.ammount,
      status: request.status,
      paymentStatus: paymentIntent.status,
      date: request.createdAt,
      message: request.message,
    };

    return { data };
  }

  @Mutation(() => SetRequestCompleteResponse)
  @UseMiddleware(isAdminAuth)
  async setRequestComplete(
    @Arg("requestId", () => Int) requestId: number
  ): Promise<SetRequestCompleteResponse> {
    const request = await SessionRequest.findOne({ where: { id: requestId } });

    if (!request) {
      return { errorMsg: "Request not found" };
    }

    request.status = "complete";
    await request.save().catch((err: any) => {
      console.log(err);
      return { errorMsg: "Problem with database" };
    });

    console.log(request);
    return { complete: true };
  }
}
