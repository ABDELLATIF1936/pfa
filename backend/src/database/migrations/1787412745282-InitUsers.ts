import { MigrationInterface, QueryRunner } from "typeorm";

export class InitUsers1787412745282 implements MigrationInterface {
    name = 'InitUsers1787412745282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."personne_mode_paiement_defaut_enum" AS ENUM('postpaid', 'wallet')`);
        await queryRunner.query(`CREATE TABLE "personne" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nom" character varying NOT NULL, "prenom" character varying NOT NULL, "email" character varying NOT NULL, "mot_de_passe" character varying NOT NULL, "telephone" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "matricule" character varying, "date_inscription" TIMESTAMP DEFAULT now(), "mode_paiement_defaut" "public"."personne_mode_paiement_defaut_enum" DEFAULT 'postpaid', "solde_wallet" numeric(10,2) DEFAULT '0', "type" character varying NOT NULL, CONSTRAINT "PK_8bcf83a7d5b107c761ac76acba5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ddd62796043c1b19ee612a53cd" ON "personne"  ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_e6f400f480981d11329cd92349" ON "personne"  ("type") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e6f400f480981d11329cd92349"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ddd62796043c1b19ee612a53cd"`);
        await queryRunner.query(`DROP TABLE "personne"`);
        await queryRunner.query(`DROP TYPE "public"."personne_mode_paiement_defaut_enum"`);
    }

}
