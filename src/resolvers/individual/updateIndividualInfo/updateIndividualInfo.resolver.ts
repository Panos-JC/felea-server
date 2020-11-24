import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getRepository } from "typeorm";
import { Individual } from "../../../entities/Individual";
import { isIndividualAuth } from "../../../middleware/isIndividualAuth";
import { MyContext } from "../../../types";
import { UpdateIndividualInfoResponse } from "./updateIndividualInfo.response";

@Resolver()
export class UpdateIndividualInfoResolver {
  private individual = getRepository(Individual);

  @Mutation(() => UpdateIndividualInfoResponse)
  @UseMiddleware(isIndividualAuth)
  async updateIndividualInfo(
    @Arg("firstName", () => String) firstName: string,
    @Arg("lastName", () => String) lastName: string,
    @Ctx() { req }: MyContext
  ): Promise<UpdateIndividualInfoResponse> {
    const individual = await this.individual.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!individual) {
      return { errorMsg: "User not found" };
    }

    individual.firstName = firstName;
    individual.lastName = lastName;
    await this.individual.save(individual);

    return { individual };
  }
}
