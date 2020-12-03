import { Arg, Ctx, Int, Query, Resolver, UseMiddleware } from "type-graphql";
import { getConnection, getRepository } from "typeorm";
import { Individual } from "../../entities/Individual";
import { SessionRequest } from "../../entities/SessionRequest";
import { isAdminAuth } from "../../middleware/isAdminAuth";
import { isIndividualAuth } from "../../middleware/isIndividualAuth";
import { MyContext } from "../../types";
import {
  RequestsByMentorResponse,
  SessionRequestByIdData,
  SessionRequestByIdResponse,
  SessionRequestResponse,
  SessionRequestsResponse,
} from "./sessionRequest.response";

@Resolver()
export class SessionRequestResolver {
  private requestRepository = getRepository(SessionRequest);
  private individualRepository = getRepository(Individual);

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

    const data: SessionRequestByIdData = {
      individual: request.individual,
      mentor: request.mentor,
      ammount: request.ammount,
      status: request.status,
      date: request.createdAt,
      message: request.message,
    };

    return { data };
  }

  @Query(() => SessionRequestsResponse)
  @UseMiddleware(isIndividualAuth)
  async individualRequests(
    @Ctx() { req }: MyContext
  ): Promise<SessionRequestsResponse> {
    const individual = await this.individualRepository.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!individual) {
      return { errorMsg: "No user found" };
    }

    const requests = await this.requestRepository
      .createQueryBuilder("req")
      .innerJoinAndSelect("req.mentor", "mentor")
      .innerJoinAndSelect("mentor.user", "user")
      .where('req."individualId" = :id', { id: individual.id })
      .orderBy('req."createdAt"', "DESC")
      .getMany();

    return { data: requests };
  }

  @Query(() => SessionRequestResponse)
  @UseMiddleware(isIndividualAuth)
  async individualRequestById(
    @Arg("requestId", () => Int) requestId: number,
    @Ctx() { req }: MyContext
  ): Promise<SessionRequestResponse> {
    const individual = await this.individualRepository.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!individual) {
      return { errorMsg: "No user found" };
    }

    const request = await this.requestRepository.findOne({
      where: { id: requestId, individual },
      relations: ["mentor", "mentor.user"],
    });

    if (!request) {
      return { errorMsg: "Request not found" };
    }

    return { data: request };
  }
}
