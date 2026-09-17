import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVehiculeToSessions1788620000000 implements MigrationInterface {
  name = 'AddVehiculeToSessions1788620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "vehicule" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "immatriculation" character varying NOT NULL,
        "marque" character varying,
        "modele" character varying,
        "client_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_vehicule_immatriculation" UNIQUE ("immatriculation"),
        CONSTRAINT "PK_vehicule" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "vehicule"
      ADD CONSTRAINT "FK_vehicule_client"
      FOREIGN KEY ("client_id") REFERENCES "personne"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "session_recharge"
      ADD "vehicule_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "session_recharge"
      ADD CONSTRAINT "FK_session_recharge_vehicule"
      FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session_recharge" DROP CONSTRAINT "FK_session_recharge_vehicule"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_recharge" DROP COLUMN "vehicule_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicule" DROP CONSTRAINT "FK_vehicule_client"`,
    );
    await queryRunner.query(`DROP TABLE "vehicule"`);
  }
}
