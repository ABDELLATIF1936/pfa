import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDesactiveeToCarteRfidStatut1790000000000 implements MigrationInterface {
  name = 'AddDesactiveeToCarteRfidStatut1790000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."carte_rfid_statut_enum" ADD VALUE IF NOT EXISTS 'desactivee'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."carte_rfid_statut_enum"
      RENAME TO "carte_rfid_statut_enum_old"
    `);
    await queryRunner.query(
      `CREATE TYPE "public"."carte_rfid_statut_enum" AS ENUM('active', 'bloquee', 'perdue')`,
    );
    await queryRunner.query(`
      ALTER TABLE "carte_rfid"
      ALTER COLUMN "statut" TYPE "public"."carte_rfid_statut_enum"
      USING "statut"::text::"public"."carte_rfid_statut_enum"
    `);
    await queryRunner.query(`DROP TYPE "public"."carte_rfid_statut_enum_old"`);
  }
}
