import {
  Arg,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Certificate } from "../../../entities/Certificate";
import { Education } from "../../../entities/Education";
import { Expertise } from "../../../entities/Expertise";
import { Industry } from "../../../entities/Industry";
import { Mentor } from "../../../entities/Mentor";
import { Skill } from "../../../entities/Skill";
import { Users } from "../../../entities/Users";
import { WorkExperience } from "../../../entities/WorkExperience";
import { isAdminAuth } from "../../../middleware/isAdminAuth";
import { CertificateInput } from "../../certificate/certificate.input";
import { CertificateResponse } from "../../certificate/certificate.response";
import { EducationInput } from "../../education/education.input";
import { EducationResponse } from "../../education/education.response";
import { ExpertiseResponse } from "../../expertise/expertise.response";
import { MentorDetailsInput } from "../../mentor/mentorDetails/mentorDetails.input";
import { MentorResponse } from "../../mentor/mentorDetails/mentorDetails.response";
import { WorkExperienceInput } from "../../workExperience/workExperience.input";
import { WorkExperienceResponse } from "../../workExperience/workExperience.response";
import { GetResponse } from "./mentorInfo.response";

@ObjectType()
class Temp {
  @Field(() => String, { nullable: true })
  errorMsg?: string;
  @Field(() => Mentor, { nullable: true })
  mentor?: Mentor;
}

@Resolver()
export class AdminMentorInfoResolver {
  private userRepository = getRepository(Users);
  private mentorRepository = getRepository(Mentor);
  private expertiseRepository = getRepository(Expertise);
  private skillRepository = getRepository(Skill);
  private experienceRepository = getRepository(WorkExperience);
  private industryRepository = getRepository(Industry);
  private educationRepository = getRepository(Education);
  private certificateRepository = getRepository(Certificate);

  @Query(() => GetResponse)
  async getBio(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<GetResponse> {
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return {};
    }

    return { result: mentor.bio };
  }

  @Query(() => GetResponse)
  async getAvatar(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<GetResponse> {
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ["user"],
    });

    if (!mentor) {
      return {};
    }

    return { result: mentor.user.avatar };
  }

  @Mutation(() => Boolean)
  async addAvatarByAdmin(
    @Arg("avatarUrl") avatarUrl: string,
    @Arg("publicId") publicId: string,
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<Boolean> {
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ["user"],
    });

    if (!mentor) {
      return false;
    }

    const user = await this.userRepository.findOne(mentor.user.id);

    if (!user) {
      return false;
    }

    user.avatar = avatarUrl;
    user.avatarPublicId = publicId;
    await this.userRepository.save(user);

    return true;
  }

  @Mutation(() => Boolean)
  async setBioByMentor(
    @Arg("mentorId", () => Int) mentorId: number,
    @Arg("bio", () => String) bio: string
  ): Promise<Boolean> {
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return false;
    }

    mentor.bio = bio;
    await this.mentorRepository.save(mentor);

    return true;
  }

  @Query(() => GetResponse)
  async getMotto(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<GetResponse> {
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return {};
    }

    return { result: mentor.motto };
  }

  @Query(() => Temp)
  async getMentorInfo(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<Temp> {
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return { errorMsg: "No mentor found" };
    }

    return { mentor };
  }

  @Mutation(() => MentorResponse)
  // @UseMiddleware(isAuth)
  async setMentorDetailsByAdmin(
    @Arg("options", () => MentorDetailsInput) options: MentorDetailsInput,
    @Arg("mentorId", () => Int) mentorId: MentorDetailsInput
  ): Promise<MentorResponse> {
    // get mentor by user id
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    mentor.firstName = options.firstName;
    mentor.lastName = options.lastName;
    mentor.title = options.title;
    mentor.rate = options.rate;
    mentor.country = options.country;
    mentor.city = options.city;
    mentor.languages = options.languages;

    await this.mentorRepository.save(mentor);

    return { mentor };
  }

  @Mutation(() => Boolean)
  async setMottoByMentor(
    @Arg("mentorId", () => Int) mentorId: number,
    @Arg("motto", () => String) motto: string
  ): Promise<Boolean> {
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return false;
    }

    mentor.motto = motto;
    await this.mentorRepository.save(mentor);

    return true;
  }

  @Mutation(() => Boolean)
  async deleteExpertiseByAdmin(
    @Arg("expertiseId", () => Int) expertiseId: number
  ): Promise<Boolean> {
    const expertise = await this.expertiseRepository.findOne(expertiseId);

    if (!expertise) {
      return false;
    }

    await this.expertiseRepository.remove(expertise);

    return true;
  }

  @Mutation(() => Boolean)
  async deleteWorkExperienceByAdmin(
    @Arg("experienceId", () => Int) experienceId: number
  ): Promise<Boolean> {
    const experience = await this.experienceRepository.findOne(experienceId);

    if (!experience) {
      return false;
    }

    await this.experienceRepository.remove(experience);

    return true;
  }

  @Mutation(() => Boolean)
  async deleteEducationByAdmin(
    @Arg("educationId", () => Int) educationId: number
  ): Promise<Boolean> {
    const education = await this.educationRepository.findOne(educationId);

    if (!education) {
      return false;
    }

    await this.educationRepository.remove(education);

    return true;
  }

  @Mutation(() => Boolean)
  async deleteCertificateByAdmin(
    @Arg("certificateId", () => Int) certificateId: number
  ): Promise<Boolean> {
    const certificate = await this.certificateRepository.findOne(certificateId);

    if (!certificate) {
      return false;
    }

    await this.certificateRepository.remove(certificate);

    return true;
  }

  @Mutation(() => CertificateResponse)
  @UseMiddleware(isAdminAuth)
  async createCertificateByAdmin(
    @Arg("input", () => CertificateInput) input: CertificateInput,
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<CertificateResponse> {
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    const certificate = new Certificate();
    certificate.title = input.title;
    certificate.organization = input.organization;
    certificate.date = input.date;
    certificate.description = input.description;
    certificate.mentor = mentor;
    await this.certificateRepository.save(certificate);

    return { certificate };
  }

  @Mutation(() => ExpertiseResponse)
  @UseMiddleware(isAdminAuth)
  async createExpertiseByAdmin(
    @Arg("mentorId", () => Int) mentorId: number,
    @Arg("skillName", () => String) skillName: string,
    @Arg("description", () => String, { nullable: true }) description?: string,
    @Arg("descriptionText", () => String, { nullable: true })
    descriptionText?: string
  ): Promise<ExpertiseResponse> {
    if (!skillName.replace(/\s+/g, "")) {
      return {
        error: { field: "skill", message: "This field must not be empty" },
      };
    }

    // Get mentor from session
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return { error: { field: "general", message: "Mentor not found" } };
    }

    const expertise = new Expertise();
    expertise.mentor = mentor;
    expertise.description = description;
    expertise.descriptionText = descriptionText;

    const skill = await this.skillRepository.findOne({
      where: { nameLowercase: skillName.toLowerCase() },
    });

    // Create skill if it does not exist
    if (!skill) {
      const newSkill = new Skill();
      newSkill.name = skillName;
      newSkill.nameLowercase = skillName.toLowerCase();

      await this.skillRepository.save(newSkill);

      expertise.skill = newSkill;
    } else {
      expertise.skill = skill;
    }

    await this.expertiseRepository.save(expertise);

    return { expertise };
  }

  @Mutation(() => WorkExperienceResponse)
  async createWorkExperienceByAdmin(
    @Arg("input") input: WorkExperienceInput,
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<WorkExperienceResponse> {
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return { error: { field: "General", message: "User not found" } };
    }

    const experience = new WorkExperience();
    experience.mentor = mentor;
    experience.role = input.role;
    experience.companyName = input.companyName;
    experience.from = input.from;
    experience.untill = input.untill;
    experience.description = input.description;
    experience.industries = [];

    // create work experiences if they dont exist
    for (const ind of input.industries) {
      const industry = await this.industryRepository.findOne({
        where: { nameLowercase: ind.toLowerCase() },
      });

      if (industry) {
        experience.industries = [...experience.industries, industry];
      } else {
        const newIndustryDto = new Industry();
        newIndustryDto.name = ind;
        newIndustryDto.nameLowercase = ind.toLowerCase();

        const newIndustry = await this.industryRepository.save(newIndustryDto);
        experience.industries = [...experience.industries, newIndustry];
      }
    }

    // save new work experience
    const newExperience = await this.experienceRepository.save(experience);

    return { workExperience: newExperience };
  }

  @Mutation(() => EducationResponse)
  async createEducationByAdmin(
    @Arg("input", () => EducationInput) input: EducationInput,
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<EducationResponse> {
    const mentor = await this.mentorRepository.findOne(mentorId);

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    const education = new Education();

    education.title = input.title;
    education.school = input.school;
    education.startDate = new Date(input.from);
    education.endDate = new Date(input.untill);
    education.description = input.description;
    education.mentor = mentor;
    await this.educationRepository.save(education);

    return { education };
  }
}
