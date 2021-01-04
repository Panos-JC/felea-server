import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1606836218553 implements MigrationInterface {
  name = "Initial1606836218551";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "company" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "boughtAccounts" integer NOT NULL, "remainingAccounts" integer NOT NULL, "code" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "adminId" integer, CONSTRAINT "UQ_711bd226b17871ae73cecca8f79" UNIQUE ("code"), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "individual" ("id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "premium" boolean NOT NULL DEFAULT false, "stripe_customer_id" character varying, "stripe_payment_method_id" character varying, "subscription_id" character varying, "user_id" integer, "companyId" integer, CONSTRAINT "REL_a9fffa3cb6d181c232454d1e5b" UNIQUE ("user_id"), CONSTRAINT "PK_65e322b841a6d5e28a488d584de" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "skill" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "nameLowercase" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_95dc6adfbc6648753022f9513d0" UNIQUE ("nameLowercase"), CONSTRAINT "PK_a0d33334424e64fb78dc3ce7196" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "expertise" ("id" SERIAL NOT NULL, "description" text NOT NULL, "descriptionText" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "skill_id" integer, "mentor_id" integer, CONSTRAINT "PK_0c1f773f9419573f6bc37eebb7f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "review" ("id" SERIAL NOT NULL, "message" text NOT NULL, "rating" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "mentorId" integer, "individualId" integer, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "session_request" ("id" SERIAL NOT NULL, "objective" character varying NOT NULL, "headline" character varying NOT NULL, "communicationTool" character varying NOT NULL, "email" character varying NOT NULL, "communicationToolId" character varying NOT NULL, "message" text NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "ammount" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "individualId" integer, "mentorId" integer, CONSTRAINT "PK_44312b413b386d959b709e3778b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "industry" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "name_lowercase" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e756cbed5e9f27221c238f11fcc" UNIQUE ("name"), CONSTRAINT "UQ_b939acdb46d6a5140b2b559b1d9" UNIQUE ("name_lowercase"), CONSTRAINT "PK_fc3e38485cff79e9fbba8f13831" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "work_experience" ("id" SERIAL NOT NULL, "role" character varying NOT NULL, "company_name" character varying NOT NULL, "description" text NOT NULL, "from" TIMESTAMP NOT NULL, "untill" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "mentor_id" integer, CONSTRAINT "PK_d4bef63ad6da7ec327515c121bd" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "mentor" ("id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "profile_complete" boolean NOT NULL DEFAULT false, "title" character varying, "motto" text, "location" character varying, "languages" character varying, "bio" text, "rate" character varying, "medium" character varying, "facebook" character varying, "linkedin" character varying, "twitter" character varying, "instagram" character varying, "user_id" integer, CONSTRAINT "REL_6e4dee415db08bb15e819c7939" UNIQUE ("user_id"), CONSTRAINT "PK_9fcebd0a40237e9b6defcbd9d74" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "activated" boolean NOT NULL DEFAULT false, "type" character varying NOT NULL, "avatar" character varying, "avatarPublicId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "admin" ("id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "user_id" integer, CONSTRAINT "REL_a28028ba709cd7e5053a86857b" UNIQUE ("user_id"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "certificate" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "organization" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "description" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "mentorId" integer, CONSTRAINT "PK_8daddfc65f59e341c2bbc9c9e43" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "education" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "school" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "description" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "mentorId" integer, CONSTRAINT "PK_bf3d38701b3030a8ad634d43bd6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "work_experience_industries_industry" ("workExperienceId" integer NOT NULL, "industryId" integer NOT NULL, CONSTRAINT "PK_26b51c4bf77baa80b9755c1d9ee" PRIMARY KEY ("workExperienceId", "industryId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2752955bbe152e97104eaf1102" ON "work_experience_industries_industry" ("workExperienceId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2462ff5837ea6926d8a0260766" ON "work_experience_industries_industry" ("industryId") `
    );
    await queryRunner.query(
      `ALTER TABLE "company" ADD CONSTRAINT "FK_8a81b99e43da19da787fb9644aa" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "individual" ADD CONSTRAINT "FK_a9fffa3cb6d181c232454d1e5b9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "individual" ADD CONSTRAINT "FK_1e90132d6e8c2a70badab49fdb9" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "expertise" ADD CONSTRAINT "FK_eb3cb1da7df82328c73abe3b499" FOREIGN KEY ("skill_id") REFERENCES "skill"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "expertise" ADD CONSTRAINT "FK_e22d9f1d85a6c4181c21e4b45f4" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_5dd76e18e1d000430387645aa45" FOREIGN KEY ("mentorId") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_170b51494d9e6b2ca4d348e13ce" FOREIGN KEY ("individualId") REFERENCES "individual"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "session_request" ADD CONSTRAINT "FK_a3c725f9287a862648cba13fda1" FOREIGN KEY ("individualId") REFERENCES "individual"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "session_request" ADD CONSTRAINT "FK_2bb09bb1d7215e51fde2df65f38" FOREIGN KEY ("mentorId") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "work_experience" ADD CONSTRAINT "FK_9a7a8514d3914a86faf8b83dd9e" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "mentor" ADD CONSTRAINT "FK_6e4dee415db08bb15e819c79396" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_a28028ba709cd7e5053a86857b4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "certificate" ADD CONSTRAINT "FK_04f4591a16daeb8c8f0503058f3" FOREIGN KEY ("mentorId") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "education" ADD CONSTRAINT "FK_248ff6f76dc7ea52d21a5204df7" FOREIGN KEY ("mentorId") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "work_experience_industries_industry" ADD CONSTRAINT "FK_2752955bbe152e97104eaf1102c" FOREIGN KEY ("workExperienceId") REFERENCES "work_experience"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "work_experience_industries_industry" ADD CONSTRAINT "FK_2462ff5837ea6926d8a0260766a" FOREIGN KEY ("industryId") REFERENCES "industry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_experience_industries_industry" DROP CONSTRAINT "FK_2462ff5837ea6926d8a0260766a"`
    );
    await queryRunner.query(
      `ALTER TABLE "work_experience_industries_industry" DROP CONSTRAINT "FK_2752955bbe152e97104eaf1102c"`
    );
    await queryRunner.query(
      `ALTER TABLE "education" DROP CONSTRAINT "FK_248ff6f76dc7ea52d21a5204df7"`
    );
    await queryRunner.query(
      `ALTER TABLE "certificate" DROP CONSTRAINT "FK_04f4591a16daeb8c8f0503058f3"`
    );
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_a28028ba709cd7e5053a86857b4"`
    );
    await queryRunner.query(
      `ALTER TABLE "mentor" DROP CONSTRAINT "FK_6e4dee415db08bb15e819c79396"`
    );
    await queryRunner.query(
      `ALTER TABLE "work_experience" DROP CONSTRAINT "FK_9a7a8514d3914a86faf8b83dd9e"`
    );
    await queryRunner.query(
      `ALTER TABLE "session_request" DROP CONSTRAINT "FK_2bb09bb1d7215e51fde2df65f38"`
    );
    await queryRunner.query(
      `ALTER TABLE "session_request" DROP CONSTRAINT "FK_a3c725f9287a862648cba13fda1"`
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_170b51494d9e6b2ca4d348e13ce"`
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_5dd76e18e1d000430387645aa45"`
    );
    await queryRunner.query(
      `ALTER TABLE "expertise" DROP CONSTRAINT "FK_e22d9f1d85a6c4181c21e4b45f4"`
    );
    await queryRunner.query(
      `ALTER TABLE "expertise" DROP CONSTRAINT "FK_eb3cb1da7df82328c73abe3b499"`
    );
    await queryRunner.query(
      `ALTER TABLE "individual" DROP CONSTRAINT "FK_1e90132d6e8c2a70badab49fdb9"`
    );
    await queryRunner.query(
      `ALTER TABLE "individual" DROP CONSTRAINT "FK_a9fffa3cb6d181c232454d1e5b9"`
    );
    await queryRunner.query(
      `ALTER TABLE "company" DROP CONSTRAINT "FK_8a81b99e43da19da787fb9644aa"`
    );
    await queryRunner.query(`DROP INDEX "IDX_2462ff5837ea6926d8a0260766"`);
    await queryRunner.query(`DROP INDEX "IDX_2752955bbe152e97104eaf1102"`);
    await queryRunner.query(`DROP TABLE "work_experience_industries_industry"`);
    await queryRunner.query(`DROP TABLE "education"`);
    await queryRunner.query(`DROP TABLE "certificate"`);
    await queryRunner.query(`DROP TABLE "admin"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "mentor"`);
    await queryRunner.query(`DROP TABLE "work_experience"`);
    await queryRunner.query(`DROP TABLE "industry"`);
    await queryRunner.query(`DROP TABLE "session_request"`);
    await queryRunner.query(`DROP TABLE "review"`);
    await queryRunner.query(`DROP TABLE "expertise"`);
    await queryRunner.query(`DROP TABLE "skill"`);
    await queryRunner.query(`DROP TABLE "individual"`);
    await queryRunner.query(`DROP TABLE "company"`);
  }
}
