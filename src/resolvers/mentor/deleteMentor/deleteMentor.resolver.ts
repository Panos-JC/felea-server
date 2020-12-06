import { Arg, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getRepository } from "typeorm";
import { Certificate } from "../../../entities/Certificate";
import { Education } from "../../../entities/Education";
import { Expertise } from "../../../entities/Expertise";
import { Mentor } from "../../../entities/Mentor";
import { Review } from "../../../entities/Review";
import { SessionRequest } from "../../../entities/SessionRequest";
import { Users } from "../../../entities/Users";
import { WorkExperience } from "../../../entities/WorkExperience";
import { isAdminAuth } from "../../../middleware/isAdminAuth";
import { DeleteEntityResponse } from "../../individual/deleteIndividual/deleteIndividual.response";

@Resolver()
export class DeleteMentorResolver {
  private mentorRepository = getRepository(Mentor);
  private userRepository = getRepository(Users);
  private educationRepository = getRepository(Education);
  private certificateRepository = getRepository(Certificate);
  private expertiseRepository = getRepository(Expertise);
  private workExperienceRepository = getRepository(WorkExperience);
  private reviewRepository = getRepository(Review);
  private sessionRequestRepository = getRepository(SessionRequest);

  @Mutation(() => DeleteEntityResponse)
  @UseMiddleware(isAdminAuth)
  async deleteMentor(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<DeleteEntityResponse> {
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return { errorMsg: "Mentor not found", deleted: false };
    }

    const user = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.mentor", "mentor")
      .where("mentor.id = :id", { id: mentorId })
      .getOne();

    if (!user) {
      return { errorMsg: "User not found", deleted: false };
    }

    // delete mentor's education
    await this.educationRepository
      .createQueryBuilder()
      .delete()
      .from(Education)
      .where('"mentorId" = :id', { id: mentorId })
      .execute();

    // delete mentor's certificates
    await this.certificateRepository
      .createQueryBuilder()
      .delete()
      .from(Certificate)
      .where('"mentorId" = :id', { id: mentorId })
      .execute();

    // delete mentor's expertise
    await this.expertiseRepository
      .createQueryBuilder()
      .delete()
      .from(Expertise)
      .where("mentor_id = :id", { id: mentorId })
      .execute();

    // delete mentor's work experience
    await this.workExperienceRepository
      .createQueryBuilder()
      .delete()
      .from(WorkExperience)
      .where("mentor_id = :id", { id: mentorId })
      .execute();

    // delete mentor's reviews
    await this.reviewRepository
      .createQueryBuilder()
      .delete()
      .from(Review)
      .where('"mentorId" = :id', { id: mentorId })
      .execute();

    // delete mentor's session requests
    await this.sessionRequestRepository
      .createQueryBuilder()
      .delete()
      .from(SessionRequest)
      .where('"mentorId" = :id', { id: mentorId })
      .execute();

    // delete mentor
    await this.mentorRepository.remove(mentor);
    await this.userRepository.remove(user);

    return { deleted: true };
  }
}
