import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceNumberAndRenameAmount1794000000000 implements MigrationInterface {
  name = 'AddInvoiceNumberAndRenameAmount1794000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE "facture_numero_seq" START 1`);
    await queryRunner.query(`ALTER TABLE "facture" ADD "numero" character varying`);
    await queryRunner.query(`
      UPDATE "facture"
      SET "numero" = 'FACT-' || EXTRACT(YEAR FROM "date_emission")::int || '-' ||
        LPAD(nextval('facture_numero_seq')::text, 5, '0')
      WHERE "numero" IS NULL
    `);
    await queryRunner.query(`ALTER TABLE "facture" ALTER COLUMN "numero" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "facture" ADD CONSTRAINT "UQ_facture_numero" UNIQUE ("numero")`);
    await queryRunner.query(`ALTER TABLE "facture" RENAME COLUMN "montant" TO "montant_total"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "facture" RENAME COLUMN "montant_total" TO "montant"`);
    await queryRunner.query(`ALTER TABLE "facture" DROP CONSTRAINT "UQ_facture_numero"`);
    await queryRunner.query(`ALTER TABLE "facture" DROP COLUMN "numero"`);
    await queryRunner.query(`DROP SEQUENCE "facture_numero_seq"`);
  }
}
