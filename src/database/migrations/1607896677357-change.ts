import {MigrationInterface, QueryRunner} from "typeorm";

export class change1607896677357 implements MigrationInterface {
    name = 'change1607896677357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "individual" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "individual" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "individual" ADD "facilitatorId" integer`);
        await queryRunner.query(`ALTER TABLE "individual" ADD CONSTRAINT "FK_3fb0017fc06485a226b4046b846" FOREIGN KEY ("facilitatorId") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "individual" DROP CONSTRAINT "FK_3fb0017fc06485a226b4046b846"`);
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "facilitatorId"`);
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "createdAt"`);
    }

}
