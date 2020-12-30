import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { getManager, getRepository } from "typeorm";
import { Industry } from "../../entities/Industry";
import { EditIndustryResponse, IndustriesResponse } from "./indutry.resopnse";

@Resolver()
export class IndustryResolver {
  private industryRepository = getRepository(Industry);

  @Query(() => [IndustriesResponse])
  async industries(): Promise<IndustriesResponse[]> {
    const industries = await getManager().query(
      `
      select i.id, i.name, i.name_lowercase , count(ii."industryId") as count
      from industry i
      left join work_experience_industries_industry ii
        on i.id = ii."industryId"
      group by i.id
      order by count desc
      `
    );
    return industries;
  }

  @Mutation(() => EditIndustryResponse)
  async editIndustry(
    @Arg("industryId", () => Int) industryId: number,
    @Arg("newName", () => String) newName: string
  ): Promise<EditIndustryResponse> {
    const industry = await this.industryRepository.findOne(industryId);

    if (!industry) {
      return { errorMsg: "Industry not found" };
    }

    industry.name = newName;
    industry.nameLowercase = newName.toLowerCase();

    try {
      const savedIndustry = await this.industryRepository.save(industry);
      return { industry: savedIndustry };
    } catch (error) {
      console.log(error);
      if (error.code === "23505") {
        return { errorMsg: "Industry already exists" };
      }
      return { errorMsg: "Something went wrong" };
    }
  }
}
