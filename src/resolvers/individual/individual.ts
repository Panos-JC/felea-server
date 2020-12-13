import { Arg, Int, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Individual } from "../../entities/Individual";

@Resolver()
export class IndividualResolver {
  private individualRepository = getRepository(Individual);

  @Query(() => Individual)
  async individual(
    @Arg("individualId", () => Int) individualId: number
  ): Promise<Individual> {
    const individual = await this.individualRepository.findOne({
      where: { id: individualId },
      relations: ["user"],
    });

    if (!individual) {
      throw new Error("Individual not found");
    }

    return individual;
  }

  @Query(() => [Individual])
  async individuals(): Promise<Individual[]> {
    const individuals = await this.individualRepository.find({
      relations: ["user", "facilitator", "company", "facilitator.user"],
      order: {
        createdAt: "ASC",
      },
    });

    console.log(individuals);

    return individuals;
  }
}
