import {MigrationInterface, QueryRunner} from "typeorm";

export class change1607961195480 implements MigrationInterface {
    name = 'change1607961195480'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mentor" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "mentor" ADD "country" character varying`);
        await queryRunner.query(`ALTER TABLE "mentor" ADD "city" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mentor" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "mentor" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "mentor" ADD "location" character varying`);
    }

}
