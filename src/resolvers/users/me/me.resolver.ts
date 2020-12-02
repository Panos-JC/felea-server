import { Ctx, Query, Resolver } from "type-graphql";
import { Users } from "../../../entities/Users";
import { MyContext } from "../../../types";
import { getRepository } from "typeorm";

@Resolver()
export class MeResolver {
  private user = getRepository(Users);

  @Query(() => Users, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<Users | null> {
    if (!req.session.userId) {
      console.log("no session");
      console.log("[SESSION]: ", req.session);
      console.log("[SESSION USER]: ", req.session.userId);

      return null;
    }

    const _user = await this.user.findOne({ id: req.session.userId });

    if (!_user) {
      console.log("no _user");
      return null;
    }

    const user = await this.user
      .createQueryBuilder("u")
      .innerJoinAndSelect(`u.${_user.type}`, _user.type)
      .where("u.id = :id", { id: _user.id })
      .getOne();

    if (!user) {
      console.log("no user");
      return null;
    }

    return user;
  }
}
