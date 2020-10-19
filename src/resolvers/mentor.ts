import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { getConnection } from "typeorm";
import { Mentor } from "../entities/Mentor";

@Resolver()
export class MentorResolver {
  @Query(() => Mentor)
  async mentor(@Arg("mentorId", () => Int) mentorId: number): Promise<Mentor> {
    const result = await getConnection()
      .getRepository(Mentor)
      .createQueryBuilder("mentor")
      .innerJoinAndSelect("mentor.user", "users")
      .where("mentor.id = :id", { id: mentorId })
      .getOne();

    console.log(result);
    return result!;
  }

  @Mutation(() => Mentor)
  async setBio(
    @Arg("mentorId", () => Int) mentorId: number,
    @Arg("bio", () => String) bio: string
  ) {
    // const mentor = await getConnection()
    //   .getRepository(Mentor)
    //   .createQueryBuilder("mentor")
    //   .update<Mentor>(Mentor, { bio })
    //   .where("mentor.id = :mentorId", { mentorId })
    //   .execute();

    const mentor = await Mentor.findOne({ id: mentorId });
    mentor!.bio = bio;

    const updatedMentor = await Mentor.save(mentor!);

    console.log(updatedMentor);
    return updatedMentor;
  }
}
