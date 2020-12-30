import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getRepository } from "typeorm";
import { Individual } from "../../../entities/Individual";
import { Mentor } from "../../../entities/Mentor";
import { SessionRequest } from "../../../entities/SessionRequest";
import { isAdminAuth } from "../../../middleware/isAdminAuth";
import { isMentorAuth } from "../../../middleware/isMentorAuth";
import { MyContext } from "../../../types";
import { SessionRequestInput } from "./sessionRequestActions.input";
import {
  CreateRequestResponse,
  RequestActionResponse,
  SetRequestCompleteResponse,
} from "./sessionRequestActions.response";

@Resolver()
export class SessionRequestActionsResolver {
  private sessionRequestRepository = getRepository(SessionRequest);
  private individualRepository = getRepository(Individual);
  private mentorRepository = getRepository(Mentor);

  @Mutation(() => RequestActionResponse)
  @UseMiddleware(isMentorAuth)
  async acceptRequest(
    @Arg("requestId", () => Int) requestId: number,
    @Arg("date", () => String) date: string
  ): Promise<RequestActionResponse> {
    const request = await this.sessionRequestRepository.findOne(requestId);

    if (!request) {
      return { errorMsg: "Request not found" };
    }
    request.selectedDate = new Date(date);
    request.status = "accepted";
    await request.save();

    return { accepted: true };
  }

  @Mutation(() => RequestActionResponse)
  @UseMiddleware(isMentorAuth)
  async declineRequest(
    @Arg("requestId", () => Int) requestId: number
  ): Promise<RequestActionResponse> {
    const request = await this.sessionRequestRepository.findOne(requestId);

    if (!request) {
      return { errorMsg: "Request not found" };
    }

    request.status = "declined";
    await request.save();

    return { declined: true };
  }

  @Mutation(() => SetRequestCompleteResponse)
  @UseMiddleware(isAdminAuth)
  async setRequestComplete(
    @Arg("requestId", () => Int) requestId: number
  ): Promise<SetRequestCompleteResponse> {
    const request = await this.sessionRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      return { errorMsg: "Request not found" };
    }

    request.status = "complete";

    await this.sessionRequestRepository.save(request);

    return { complete: true };
  }

  @Mutation(() => CreateRequestResponse)
  async createSessionRequest(
    @Arg("input", () => SessionRequestInput) input: SessionRequestInput,
    @Ctx() { req }: MyContext
  ): Promise<CreateRequestResponse> {
    const individual = await this.individualRepository.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!individual) {
      return { errorMsg: "User not found" };
    }

    const mentor = await this.mentorRepository.findOne(input.mentorId);

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    const sessionRequest = new SessionRequest();
    sessionRequest.individual = individual;
    sessionRequest.mentor = mentor;
    sessionRequest.objective = input.objective;
    sessionRequest.headline = input.headline;
    sessionRequest.email = input.email;
    sessionRequest.communicationTool = input.communicationTool;
    sessionRequest.communicationToolId = input.communicationToolId;
    sessionRequest.suggestedDate1 = input.suggestedDate1;
    sessionRequest.suggestedDate2 = input.suggestedDate2;
    sessionRequest.suggestedDate3 = input.suggestedDate3;
    sessionRequest.message = input.message;
    sessionRequest.ammount = input.ammount;

    await this.sessionRequestRepository.save(sessionRequest);

    return { sessionRequest };
  }
}
