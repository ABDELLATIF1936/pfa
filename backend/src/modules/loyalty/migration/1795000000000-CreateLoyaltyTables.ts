import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLoyaltyTables1795000000000 implements MigrationInterface {
  name = 'CreateLoyaltyTables1795000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "niveau_fidelite" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nom" character varying(100) NOT NULL,
        "seuil_points" integer NOT NULL DEFAULT 0,
        "pourcentage_reduction" numeric(5,2) NOT NULL DEFAULT '0',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_niveau_fidelite" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "recompense" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nom" character varying(150) NOT NULL,
        "cout_points" integer NOT NULL,
        "description" text,
        "actif" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_recompense" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "compte_fidelite" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "points" integer NOT NULL DEFAULT 0,
        "client_id" uuid NOT NULL,
        "niveau_actuel_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_compte_fidelite_client_id" UNIQUE ("client_id"),
        CONSTRAINT "PK_compte_fidelite" PRIMARY KEY ("id"),
        CONSTRAINT "FK_compte_fidelite_personne" FOREIGN KEY ("client_id") REFERENCES "personne"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_compte_fidelite_niveau" FOREIGN KEY ("niveau_actuel_id") REFERENCES "niveau_fidelite"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."historique_points_fidelite_type_enum"
      AS ENUM('gain', 'echange')
    `);

    await queryRunner.query(`
      CREATE TABLE "historique_points_fidelite" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "compte_fidelite_id" uuid NOT NULL,
        "type" "public"."historique_points_fidelite_type_enum" NOT NULL,
        "points" integer NOT NULL,
        "facture_id" uuid,
        "recompense_id" uuid,
        "date_operation" TIMESTAMP NOT NULL DEFAULT now(),
        "description" character varying,
        CONSTRAINT "PK_historique_points_fidelite" PRIMARY KEY ("id"),
        CONSTRAINT "FK_historique_points_fidelite_compte" FOREIGN KEY ("compte_fidelite_id") REFERENCES "compte_fidelite"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_historique_points_fidelite_facture" FOREIGN KEY ("facture_id") REFERENCES "facture"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "FK_historique_points_fidelite_recompense" FOREIGN KEY ("recompense_id") REFERENCES "recompense"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      INSERT INTO "niveau_fidelite" ("nom", "seuil_points", "pourcentage_reduction") VALUES
      ('Bronze', 0, 0),
      ('Argent', 500, 5),
      ('Gold', 2000, 10)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "historique_points_fidelite"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "compte_fidelite"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recompense"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "niveau_fidelite"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."historique_points_fidelite_type_enum"`);
  }
}
