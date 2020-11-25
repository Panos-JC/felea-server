import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Certificate } from "../../entities/Certificate";
import { Mentor } from "../../entities/Mentor";
import { isMentorAuth } from "../../middleware/isMentorAuth";
import { MyContext } from "../../types";
import { CertificateInput } from "./certificate.input";
import {
  CertificateResponse,
  CertificatesResponse,
} from "./certificate.response";

@Resolver()
export class CertificateResolver {
  private mentor = getRepository(Mentor);
  private certificate = getRepository(Certificate);

  @Query(() => CertificatesResponse)
  async certificates(
    @Ctx() { req }: MyContext,
    @Arg("mentorId", () => Int, { nullable: true }) mentorId?: number
  ): Promise<CertificatesResponse> {
    let mentor;
    if (mentorId) {
      mentor = await this.mentor.findOne(mentorId);
    } else {
      mentor = await this.mentor.findOne({
        where: { user: { id: req.session.userId } },
      });
    }

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    const certificates = await this.certificate
      .createQueryBuilder("certificate")
      .where('certificate."mentorId" = :mentorId', { mentorId: mentor.id })
      .getMany();

    return { data: certificates };
  }

  @Mutation(() => CertificateResponse)
  @UseMiddleware(isMentorAuth)
  async createCertificate(
    @Arg("input", () => CertificateInput) input: CertificateInput,
    @Ctx() { req }: MyContext
  ): Promise<CertificateResponse> {
    const mentor = await this.mentor.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    const certificate = new Certificate();
    certificate.title = input.title;
    certificate.organization = input.organization;
    certificate.date = new Date(parseInt(input.date));
    certificate.description = input.description;
    certificate.mentor = mentor;
    await this.certificate.save(certificate);

    return { certificate };
  }

  @Mutation(() => CertificateResponse)
  @UseMiddleware(isMentorAuth)
  async updateCertificate(
    @Arg("input", () => CertificateInput) input: CertificateInput,
    @Arg("id", () => Int) id: number
  ): Promise<CertificateResponse> {
    const certificate = await this.certificate.findOne(id);

    if (!certificate) {
      return { errorMsg: "Certificate not found" };
    }

    certificate.title = input.title;
    certificate.organization = input.organization;
    certificate.date = new Date(parseInt(input.date));
    certificate.description = input.description;
    await this.certificate.save(certificate);

    return { certificate };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isMentorAuth)
  async deleteCertificate(@Arg("id", () => Int) id: number): Promise<boolean> {
    const certificate = await this.certificate.findOne(id);

    if (!certificate) {
      return false;
    }

    await this.certificate.remove(certificate);

    return true;
  }
}
