import { Query, Resolver } from "type-graphql";
import { Individual } from "../entities/Individual";

@Resolver()
export class IndividualResolver {
  @Query(() => [Individual])
  async individuals(): Promise<Individual[]> {
    const individuals = await Individual.find({ relations: ["user"] });

    console.log(individuals);
    return individuals;
  }
}
