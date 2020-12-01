import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Users } from "../../../entities/Users";
import { MyContext } from "../../../types";

@Resolver()
export class ConfirmUserResolver {
  private userRepository = getRepository(Users);
  @Mutation(() => Boolean)
  async confirmUser(
    @Arg("token") token: string,
    @Ctx() { redis }: MyContext
  ): Promise<boolean> {
    const userId = await redis.get(token);

    if (!userId) {
      return false;
    }

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      return false;
    }

    user.activated = true;
    await this.userRepository.save(user);
    await redis.del(token);

    return true;
  }
}
