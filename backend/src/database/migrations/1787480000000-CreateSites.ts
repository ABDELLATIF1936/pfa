import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSites1787480000000 implements MigrationInterface {
  name = 'CreateSites1787480000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "site" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nom" character varying NOT NULL,
        "adresse" character varying NOT NULL,
        "ville" character varying NOT NULL,
        "latitude" numeric(10,7) NOT NULL,
        "longitude" numeric(10,7) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_site_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_site_latitude" CHECK ("latitude" BETWEEN -90 AND 90),
        CONSTRAINT "CHK_site_longitude" CHECK ("longitude" BETWEEN -180 AND 180)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_site_ville" ON "site" ("ville")`,
    );

    await queryRunner.query(`
      CREATE TABLE "borne" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_id" uuid NOT NULL,
        CONSTRAINT "PK_borne_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_borne_site" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_borne_site_id" ON "borne" ("site_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_borne_site_id"`);
    await queryRunner.query(`DROP TABLE "borne"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_site_ville"`);
    await queryRunner.query(`DROP TABLE "site"`);
  }
}