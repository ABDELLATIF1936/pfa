import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGrilleTarifaire1792000000000 implements MigrationInterface {
  name = 'CreateGrilleTarifaire1792000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "grille_tarifaire" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "prix_par_kwh" numeric(10,4) NOT NULL,
        "prix_par_minute" numeric(10,4),
        "date_effective" TIMESTAMP NOT NULL,
        "libelle" character varying,
        "actif" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_grille_tarifaire" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_grille_tarifaire_date_effective"
      ON "grille_tarifaire" ("date_effective")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_grille_tarifaire_date_effective"`);
    await queryRunner.query(`DROP TABLE "grille_tarifaire"`);
  }
}
