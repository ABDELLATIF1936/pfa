import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignSessionAndBorneStatuses1791000000000 implements MigrationInterface {
  name = 'AlignSessionAndBorneStatuses1791000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "session_recharge"
      ALTER COLUMN "methodeAuth" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."session_recharge_methodeauth_enum"
      RENAME TO "session_recharge_methodeauth_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."session_recharge_methodeauth_enum"
      AS ENUM('rfid', 'qrcode')
    `);
    await queryRunner.query(`
      ALTER TABLE "session_recharge"
      ALTER COLUMN "methodeAuth" TYPE "public"."session_recharge_methodeauth_enum"
      USING CASE WHEN "methodeAuth"::text = 'qr' THEN 'qrcode' ELSE "methodeAuth"::text END::"public"."session_recharge_methodeauth_enum"
    `);
    await queryRunner.query(`
      ALTER TABLE "session_recharge"
      ALTER COLUMN "methodeAuth" SET DEFAULT 'rfid'
    `);
    await queryRunner.query(`DROP TYPE "public"."session_recharge_methodeauth_enum_old"`);
    await queryRunner.query(`
      ALTER TYPE "public"."session_recharge_statut_enum"
      ADD VALUE IF NOT EXISTS 'en_panne'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."borne_statut_enum"
      ADD VALUE IF NOT EXISTS 'en_panne'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "session_recharge"
      ALTER COLUMN "methodeAuth" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."session_recharge_methodeauth_enum"
      RENAME TO "session_recharge_methodeauth_enum_new"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."session_recharge_methodeauth_enum"
      AS ENUM('rfid', 'qr')
    `);
    await queryRunner.query(`
      ALTER TABLE "session_recharge"
      ALTER COLUMN "methodeAuth" TYPE "public"."session_recharge_methodeauth_enum"
      USING CASE WHEN "methodeAuth"::text = 'qrcode' THEN 'qr' ELSE "methodeAuth"::text END::"public"."session_recharge_methodeauth_enum"
    `);
    await queryRunner.query(`
      ALTER TABLE "session_recharge"
      ALTER COLUMN "methodeAuth" SET DEFAULT 'rfid'
    `);
    await queryRunner.query(`DROP TYPE "public"."session_recharge_methodeauth_enum_new"`);
  }
}
