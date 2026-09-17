import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBorneFields1787498343015 implements MigrationInterface {
    name = 'AddBorneFields1787498343015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borne" DROP CONSTRAINT "FK_borne_site"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_site_ville"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_borne_site_id"`);
        await queryRunner.query(`ALTER TABLE "site" DROP CONSTRAINT "CHK_site_latitude"`);
        await queryRunner.query(`ALTER TABLE "site" DROP CONSTRAINT "CHK_site_longitude"`);
        await queryRunner.query(`ALTER TABLE "borne" ADD "identifiant_unique" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "borne" ADD CONSTRAINT "UQ_9e28ae05f99ec002bd5cbd1ceed" UNIQUE ("identifiant_unique")`);
        await queryRunner.query(`CREATE TYPE "public"."borne_type_borne_enum" AS ENUM('AC', 'DC')`);
        await queryRunner.query(`ALTER TABLE "borne" ADD "type_borne" "public"."borne_type_borne_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "borne" ADD "puissance" numeric(6,2) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."borne_statut_enum" AS ENUM('disponible', 'en_charge', 'hors_service', 'maintenance')`);
        await queryRunner.query(`ALTER TABLE "borne" ADD "statut" "public"."borne_statut_enum" NOT NULL DEFAULT 'disponible'`);
        await queryRunner.query(`ALTER TABLE "borne" ADD "qr_code_url" character varying`);
        await queryRunner.query(`ALTER TABLE "borne" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "borne" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_d28ea6944c707ddde79aa254fc" ON "site"  ("ville") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9e28ae05f99ec002bd5cbd1cee" ON "borne"  ("identifiant_unique") `);
        await queryRunner.query(`ALTER TABLE "borne" ADD CONSTRAINT "FK_616b6f9d685f002f3bc37afa7ca" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borne" DROP CONSTRAINT "FK_616b6f9d685f002f3bc37afa7ca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e28ae05f99ec002bd5cbd1cee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d28ea6944c707ddde79aa254fc"`);
        await queryRunner.query(`ALTER TABLE "borne" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "borne" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "borne" DROP COLUMN "qr_code_url"`);
        await queryRunner.query(`ALTER TABLE "borne" DROP COLUMN "statut"`);
        await queryRunner.query(`DROP TYPE "public"."borne_statut_enum"`);
        await queryRunner.query(`ALTER TABLE "borne" DROP COLUMN "puissance"`);
        await queryRunner.query(`ALTER TABLE "borne" DROP COLUMN "type_borne"`);
        await queryRunner.query(`DROP TYPE "public"."borne_type_borne_enum"`);
        await queryRunner.query(`ALTER TABLE "borne" DROP CONSTRAINT "UQ_9e28ae05f99ec002bd5cbd1ceed"`);
        await queryRunner.query(`ALTER TABLE "borne" DROP COLUMN "identifiant_unique"`);
        await queryRunner.query(`ALTER TABLE "site" ADD CONSTRAINT "CHK_site_longitude" CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))`);
        await queryRunner.query(`ALTER TABLE "site" ADD CONSTRAINT "CHK_site_latitude" CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)))`);
        await queryRunner.query(`CREATE INDEX "IDX_borne_site_id" ON "borne" USING btree ("site_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_site_ville" ON "site" USING btree ("ville") `);
        await queryRunner.query(`ALTER TABLE "borne" ADD CONSTRAINT "FK_borne_site" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
