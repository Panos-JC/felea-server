import {MigrationInterface, QueryRunner} from "typeorm";

export class Changes1609775726924 implements MigrationInterface {
    name = 'Changes1609775726924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_experience" ADD "present" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "session_request" ADD "suggestedDate1" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session_request" ADD "suggestedDate2" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session_request" ADD "suggestedDate3" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session_request" ADD "selectedDate" TIMESTAMP DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "work_experience" ALTER COLUMN "untill" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_experience" ALTER COLUMN "untill" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session_request" DROP COLUMN "selectedDate"`);
        await queryRunner.query(`ALTER TABLE "session_request" DROP COLUMN "suggestedDate3"`);
        await queryRunner.query(`ALTER TABLE "session_request" DROP COLUMN "suggestedDate2"`);
        await queryRunner.query(`ALTER TABLE "session_request" DROP COLUMN "suggestedDate1"`);
        await queryRunner.query(`ALTER TABLE "work_experience" DROP COLUMN "present"`);
    }

}
