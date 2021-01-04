import {MigrationInterface, QueryRunner} from "typeorm";

export class change1607292188127 implements MigrationInterface {
    name = 'change1607292188127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "stripe_customer_id"`);
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "stripe_payment_method_id"`);
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "subscription_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "individual" ADD "subscription_id" character varying`);
        await queryRunner.query(`ALTER TABLE "individual" ADD "stripe_payment_method_id" character varying`);
        await queryRunner.query(`ALTER TABLE "individual" ADD "stripe_customer_id" character varying`);
    }

}
