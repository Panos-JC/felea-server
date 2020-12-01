import { Ctx, Query, Resolver } from "type-graphql";
import { Users } from "../../../entities/Users";
import { MyContext } from "../../../types";
import { getRepository } from "typeorm";
import { MeResponse } from "./me.response";

@Resolver()
export class MeResolver {
  private user = getRepository(Users);

  @Query(() => MeResponse)
  async me(@Ctx() { req }: MyContext): Promise<MeResponse> {
    if (!req.session.userId) {
      return { errorMsg: "No Session" };
    }

    const _user = await this.user.findOne({ id: req.session.userId });

    if (!_user) {
      return { errorMsg: "_User not found" };
    }

    const user = await this.user
      .createQueryBuilder("u")
      .innerJoinAndSelect(`u.${_user.type}`, _user.type)
      .where("u.id = :id", { id: _user.id })
      .getOne();

    if (!user) {
      return { errorMsg: "User not found" };
    }

    return { me: user };
  }
}
