import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Users } from "../../../entities/Users";
import { MyContext } from "../../../types";
import { UserResponse } from "../register/register.response";
import { getRepository } from "typeorm";
import cloudinary from "../../../utils/cloudinary";
import { AvatarResponse } from "./avatar.response";

@Resolver()
export class AvatarResolver {
  private userRepository = getRepository(Users);

  @Mutation(() => UserResponse)
  async addAvatar(
    @Arg("avatarUrl") avatarUrl: string,
    @Arg("publicId") publicId: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id: req.session.userId },
    });

    if (!user) {
      return { errors: [{ field: "avatar", message: "User not found" }] };
    }

    user.avatar = avatarUrl;
    user.avatarPublicId = publicId;
    await user.save();

    return { user };
  }

  @Mutation(() => AvatarResponse)
  async uploadAvatar(
    @Arg("photo", () => String) photo: string,
    @Ctx() { req }: MyContext
  ): Promise<AvatarResponse> {
    const user = await this.userRepository.findOne(req.session.userId);

    if (!user) {
      return { errorMsg: "User not found." };
    }

    try {
      const result = await cloudinary.uploader.upload(photo, {
        width: 600,
        height: 600,
        gravity: "face",
        zoom: "0.5",
        crop: "thumb",
      });

      user.avatar = result.secure_url;
      user.avatarPublicId = result.public_id;
      await this.userRepository.save(user);

      return { user };
    } catch (error) {
      console.log(error);
      return { errorMsg: "Something went wrnog." };
    }
  }
}
