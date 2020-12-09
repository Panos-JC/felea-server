import {
  Arg,
  Ctx,
  Int,
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
import {
  CompanyResponse,
  DeleteCompanyResponse,
  EmployeesResponse,
} from "./company.response";
import { getConnection, getRepository } from "typeorm";
import { Individual } from "../../entities/Individual";

@Resolver()
export class CompanyResolver {
  private companyRepository = getRepository(Company);

  @Mutation(() => CompanyResponse)
  @UseMiddleware(isAdminAuth)
  async createCompany(
    @Arg("input", () => CreateCompanyInput) input: CreateCompanyInput,
    @Ctx() { req }: MyContext
  ): Promise<CompanyResponse> {
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

  @Mutation(() => DeleteCompanyResponse)
  @UseMiddleware(isAdminAuth)
  async deleteCompany(
    @Arg("companyId", () => Int) companyId: number
  ): Promise<DeleteCompanyResponse> {
    const company = await this.companyRepository.findOne(companyId);

    if (!company) {
      return { errorMsg: "Company not found" };
    }

    try {
      await this.companyRepository.remove(company);
    } catch (error) {
      if (error.code === "23503") {
        // PG_FOREIGN_KEY_VIOLATION
        return { errorMsg: "This company has associated employees" };
      }
    }

    return { deleted: true };
  }

  @Query(() => [Company])
  @UseMiddleware(isAdminAuth)
  async companies(): Promise<Company[]> {
    const companies = await Company.find({ relations: ["admin"] });

    return companies;
  }

  @Query(() => CompanyResponse)
  @UseMiddleware(isAdminAuth)
  async company(
    @Arg("companyId", () => Int) companyId: number
  ): Promise<CompanyResponse> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ["admin"],
    });

    if (!company) {
      return { errorMsg: "Company not found" };
    }

    return { company };
  }

  @Query(() => EmployeesResponse)
  @UseMiddleware(isAdminAuth)
  async employees(
    @Arg("companyId", () => Int) companyId: number
  ): Promise<EmployeesResponse> {
    const company = await this.companyRepository.findOne(companyId);

    if (!company) {
      return { errorMsg: "Company not found" };
    }

    const data = await getConnection()
      .createQueryBuilder()
      .select(["individual.id", "individual.firstName", "individual.lastName"])
      .from(Individual, "individual")
      .leftJoinAndSelect("individual.user", "user")
      .loadRelationCountAndMap(
        "individual.sessionRequestsCount",
        "individual.sessionRequests"
      )
      .where('individual."companyId" = :id', { id: companyId })
      .getMany();

    return { data };
  }
}
