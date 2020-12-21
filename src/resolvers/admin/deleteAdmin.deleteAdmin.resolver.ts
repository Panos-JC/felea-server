import { Arg, Field, Int, Mutation, ObjectType, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Admin } from "../../entities/Admin";
import { Users } from "../../entities/Users";

@ObjectType()
class DeleteAdminResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => Boolean)
  deleted: boolean;
}

@Resolver()
export class DeleteAdminResolver {
  private adminRepository = getRepository(Admin);
  private userRepository = getRepository(Users);

  @Mutation(() => DeleteAdminResponse)
  async deleteAdmin(
    @Arg("adminId", () => Int) adminId: number
  ): Promise<DeleteAdminResponse> {
    const admin = await this.adminRepository.findOne(adminId);

    if (!admin) {
      throw new Error("not found");
    }

    const user = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.admin", "admin")
      .where("admin.id = :id", { id: adminId })
      .getOne();

    if (!user) {
      throw new Error("not found");
    }

    //delete admin
    try {
      await this.adminRepository.remove(admin);
      await this.userRepository.remove(user);
      return { deleted: true };
    } catch (error) {
      console.log(error);
      if (error.code === "23503") {
        return {
          errorMsg: "Admin is associated with other data",
          deleted: false,
        };
      }
      return { errorMsg: "Something went wrong", deleted: false };
    }
  }
}
