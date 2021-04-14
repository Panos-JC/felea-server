import { MigrationInterface, QueryRunner } from "typeorm";

export class Product1618417114373 implements MigrationInterface {
  name = "Product1618417114373";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "price" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "price" SET NOT NULL`
    );
  }
}
