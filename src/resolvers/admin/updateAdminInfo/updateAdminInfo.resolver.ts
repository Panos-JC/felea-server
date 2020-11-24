import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { Admin } from "../../../entities/Admin";

import { getRepository } from "typeorm";
import { UpdateAdminInfoResponse } from "./updateAdminInfo.response";
import { MyContext } from "../../../types";
import { isAdminAuth } from "../../../middleware/isAdminAuth";

@Resolver()
export class UpdateAdminInfoResolver {
  private admin = getRepository(Admin);

  @Mutation(() => UpdateAdminInfoResponse)
  @UseMiddleware(isAdminAuth)
  async updateAdminInfo(
    @Arg("firstName", () => String) firstName: string,
    @Arg("lastName", () => String) lastName: string,
    @Ctx() { req }: MyContext
  ): Promise<UpdateAdminInfoResponse> {
    const admin = await this.admin.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!admin) {
      return { errorMsg: "Admin not found" };
    }

    admin.firstName = firstName;
    admin.lastName = lastName;
    await this.admin.save(admin);

    return { admin };
  }
}
