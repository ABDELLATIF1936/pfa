import { MigrationInterface, QueryRunner } from "typeorm";

export class RestoreSiteChecks1787498665251 implements MigrationInterface {
    name = 'RestoreSiteChecks1787498665251'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borne" DROP CONSTRAINT "UQ_9e28ae05f99ec002bd5cbd1ceed"`);
        await queryRunner.query(`ALTER TABLE "site" ADD CONSTRAINT "CHK_site_longitude" CHECK ("longitude" BETWEEN -180 AND 180)`);
        await queryRunner.query(`ALTER TABLE "site" ADD CONSTRAINT "CHK_site_latitude" CHECK ("latitude" BETWEEN -90 AND 90)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site" DROP CONSTRAINT "CHK_site_latitude"`);
        await queryRunner.query(`ALTER TABLE "site" DROP CONSTRAINT "CHK_site_longitude"`);
        await queryRunner.query(`ALTER TABLE "borne" ADD CONSTRAINT "UQ_9e28ae05f99ec002bd5cbd1ceed" UNIQUE ("identifiant_unique")`);
    }

}
