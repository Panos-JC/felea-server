import {MigrationInterface, QueryRunner} from "typeorm";

export class change1607458592394 implements MigrationInterface {
    name = 'change1607458592394'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expertise" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "expertise" ALTER COLUMN "descriptionText" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expertise" ALTER COLUMN "descriptionText" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "expertise" ALTER COLUMN "description" SET NOT NULL`);
    }

}
