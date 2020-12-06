import { Arg, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getRepository } from "typeorm";
import { Individual } from "../../../entities/Individual";
import { Review } from "../../../entities/Review";
import { SessionRequest } from "../../../entities/SessionRequest";
import { Users } from "../../../entities/Users";
import { isAdminAuth } from "../../../middleware/isAdminAuth";
import { DeleteEntityResponse } from "./deleteIndividual.response";

@Resolver()
export class DeleteIndividualResolver {
  private userRepository = getRepository(Users);
  private individualRepository = getRepository(Individual);
  private sessionRequestRepository = getRepository(SessionRequest);
  private reviewRepository = getRepository(Review);

  @Mutation(() => DeleteEntityResponse)
  @UseMiddleware(isAdminAuth)
  async deleteIndividual(
    @Arg("individualId", () => Int) individualId: number
  ): Promise<DeleteEntityResponse> {
    const individual = await this.individualRepository.findOne(individualId);

    if (!individual) {
      return { errorMsg: "Individual not found", deleted: false };
    }

    const user = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.individual", "individual")
      .where("individual.id = :id", { id: individualId })
      .getOne();

    if (!user) {
      return { errorMsg: "User not found", deleted: false };
    }

    // delete individual's session requests
    await this.sessionRequestRepository
      .createQueryBuilder()
      .delete()
      .from(SessionRequest)
      .where('"individualId" = :id', { id: individualId })
      .execute();

    // delete individual's reviews
    await this.reviewRepository
      .createQueryBuilder()
      .delete()
      .from(Review)
      .where('"individualId" = :id', { id: individualId })
      .execute();

    // delete individual
    await this.individualRepository.remove(individual);
    await this.userRepository.remove(user);

    return { deleted: true };
  }
}
