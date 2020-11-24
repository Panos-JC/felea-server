import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Users } from "../../../entities/Users";
import { MyContext } from "../../../types";
import { UserResponse } from "../register/register.response";
import { getRepository } from "typeorm";

@Resolver()
export class AvatarResolver {
  private user = getRepository(Users);

  @Mutation(() => UserResponse)
  async addAvatar(
    @Arg("avatarUrl") avatarUrl: string,
    @Arg("publicId") publicId: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await this.user.findOne({ where: { id: req.session.userId } });

    if (!user) {
      return { errors: [{ field: "avatar", message: "User not found" }] };
    }

    user.avatar = avatarUrl;
    user.avatarPublicId = publicId;
    await user.save();

    return { user };
  }
}
