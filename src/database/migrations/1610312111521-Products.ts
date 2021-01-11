import {MigrationInterface, QueryRunner} from "typeorm";

export class Products1610312111521 implements MigrationInterface {
    name = 'Products1610312111521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "subtitle" character varying, "image" character varying NOT NULL, "imagePublicId" character varying NOT NULL, "descriptionRichText" character varying NOT NULL, "description" character varying NOT NULL, "price" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "session_request" ALTER COLUMN "selectedDate" SET DEFAULT null`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_request" ALTER COLUMN "selectedDate" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
