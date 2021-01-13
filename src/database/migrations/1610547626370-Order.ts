import {MigrationInterface, QueryRunner} from "typeorm";

export class Order1610547626370 implements MigrationInterface {
    name = 'Order1610547626370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "individualId" integer, "productId" integer, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "session_request" ALTER COLUMN "selectedDate" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_9584eea9b66073dfac90582d441" FOREIGN KEY ("individualId") REFERENCES "individual"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_88991860e839c6153a7ec878d39" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_88991860e839c6153a7ec878d39"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_9584eea9b66073dfac90582d441"`);
        await queryRunner.query(`ALTER TABLE "session_request" ALTER COLUMN "selectedDate" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "order"`);
    }

}
