import { Query, Resolver } from "type-graphql";
import { Admin } from "../entities/Admin";

@Resolver()
export class AdminResolver {
  @Query(() => [Admin])
  async admins(): Promise<Admin[]> {
    const admins = await Admin.find({ relations: ["user"] });

    console.log(admins);
    return admins;
  }
}
