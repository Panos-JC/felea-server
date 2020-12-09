import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Admin } from "../../entities/Admin";
import { Company } from "../../entities/Company";
import { isAdminAuth } from "../../middleware/isAdminAuth";
import { MyContext } from "../../types";
import { CreateCompanyInput } from "../inputTypes/CreateCompanyInput";
import { nanoid } from "nanoid";
import { CreateCompanyResponse } from "./company.response";

@Resolver()
export class CompanyResolver {
  @Mutation(() => CreateCompanyResponse)
  @UseMiddleware(isAdminAuth)
  async createCompany(
    @Arg("input", () => CreateCompanyInput) input: CreateCompanyInput,
    @Ctx() { req }: MyContext
  ): Promise<CreateCompanyResponse> {
    const admin = await Admin.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!admin) {
      return { errorMsg: "Admin not found" };
    }

    const code = nanoid(10);

    const existingCompany = await Company.findOne({ where: { code } });

    if (existingCompany) {
      return { errorMsg: "Code generation error, please try again" };
    }

    const company = new Company();
    company.name = input.name;
    company.boughtAccounts = input.accounts;
    company.remainingAccounts = input.accounts;
    company.code = code;
    company.admin = admin;
    await company.save();

    return { company };
  }

  @Query(() => [Company])
  @UseMiddleware(isAdminAuth)
  async companies(): Promise<Company[]> {
    const companies = await Company.find({ relations: ["admin"] });

    return companies;
  }
}
