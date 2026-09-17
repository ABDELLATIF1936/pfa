import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePhoto1787417493671 implements MigrationInterface {
    name = 'AddProfilePhoto1787417493671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personne" ADD "photo_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personne" DROP COLUMN "photo_url"`);
    }

}
