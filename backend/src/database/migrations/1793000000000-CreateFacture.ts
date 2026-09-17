import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFacture1793000000000 implements MigrationInterface {
  name = 'CreateFacture1793000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."facture_statut_paiement_enum"
      AS ENUM('en_attente', 'payee', 'echouee')
    `);
    await queryRunner.query(`
      CREATE TABLE "facture" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "session_id" uuid NOT NULL,
        "montant" numeric(10,2) NOT NULL,
        "grille_tarifaire_id" uuid NOT NULL,
        "date_emission" TIMESTAMP NOT NULL DEFAULT now(),
        "statut_paiement" "public"."facture_statut_paiement_enum" NOT NULL DEFAULT 'en_attente',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_facture_session_id" UNIQUE ("session_id"),
        CONSTRAINT "PK_facture" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "facture"
      ADD CONSTRAINT "FK_facture_session"
      FOREIGN KEY ("session_id") REFERENCES "session_recharge"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "facture"
      ADD CONSTRAINT "FK_facture_grille_tarifaire"
      FOREIGN KEY ("grille_tarifaire_id") REFERENCES "grille_tarifaire"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "facture" DROP CONSTRAINT "FK_facture_grille_tarifaire"`);
    await queryRunner.query(`ALTER TABLE "facture" DROP CONSTRAINT "FK_facture_session"`);
    await queryRunner.query(`DROP TABLE "facture"`);
    await queryRunner.query(`DROP TYPE "public"."facture_statut_paiement_enum"`);
  }
}
