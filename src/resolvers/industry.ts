import { Query, Resolver } from "type-graphql";
import { Industry } from "../entities/Industry";

@Resolver()
export class IndustryResolver {
  @Query(() => [Industry])
  async industries() {
    const industries = await Industry.find({});

    console.log(industries);
    return industries;
  }
}
