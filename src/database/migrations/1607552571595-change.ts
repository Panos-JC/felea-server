import {MigrationInterface, QueryRunner} from "typeorm";

export class change1607552571595 implements MigrationInterface {
    name = 'change1607552571595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mentor" ADD "website" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mentor" DROP COLUMN "website"`);
    }

}
