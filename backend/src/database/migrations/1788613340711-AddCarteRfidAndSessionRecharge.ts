import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCarteRfidAndSessionRecharge1788613340711 implements MigrationInterface {
    name = 'AddCarteRfidAndSessionRecharge1788613340711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."carte_rfid_statut_enum" AS ENUM('active', 'bloquee', 'perdue')`);
        await queryRunner.query(`CREATE TABLE "carte_rfid" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifiant_unique" character varying NOT NULL, "statut" "public"."carte_rfid_statut_enum" NOT NULL DEFAULT 'active', "client_id" uuid NOT NULL, "date_activation" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2835aa2fe698aeb4e72905f5c60" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c5423388fc9fb8dff7e4dcc755" ON "carte_rfid"  ("identifiant_unique") `);
        await queryRunner.query(`CREATE TYPE "public"."session_recharge_methodeauth_enum" AS ENUM('rfid', 'qr')`);
        await queryRunner.query(`CREATE TYPE "public"."session_recharge_statut_enum" AS ENUM('en_cours', 'terminee', 'interrompue')`);
        await queryRunner.query(`CREATE TABLE "session_recharge" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ocpp_transaction_id" SERIAL NOT NULL, "date_debut" TIMESTAMP NOT NULL, "date_fin" TIMESTAMP, "energie_consommee" numeric(10,3) NOT NULL DEFAULT '0', "methodeAuth" "public"."session_recharge_methodeauth_enum" NOT NULL DEFAULT 'rfid', "statut" "public"."session_recharge_statut_enum" NOT NULL DEFAULT 'en_cours', "borne_id" uuid NOT NULL, "client_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2034157d08bd2035dbd7fdc144e" UNIQUE ("ocpp_transaction_id"), CONSTRAINT "PK_45a8d446ba458c1a57a7f30783b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2034157d08bd2035dbd7fdc144" ON "session_recharge"  ("ocpp_transaction_id") `);
        await queryRunner.query(`ALTER TABLE "carte_rfid" ADD CONSTRAINT "FK_c289e23ab20343006e6479d14a4" FOREIGN KEY ("client_id") REFERENCES "personne"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_recharge" ADD CONSTRAINT "FK_82d41a4cce9b9480069fc03c25e" FOREIGN KEY ("borne_id") REFERENCES "borne"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_recharge" ADD CONSTRAINT "FK_79ae6f4460cdaaabd0bd65e26ff" FOREIGN KEY ("client_id") REFERENCES "personne"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_recharge" DROP CONSTRAINT "FK_79ae6f4460cdaaabd0bd65e26ff"`);
        await queryRunner.query(`ALTER TABLE "session_recharge" DROP CONSTRAINT "FK_82d41a4cce9b9480069fc03c25e"`);
        await queryRunner.query(`ALTER TABLE "carte_rfid" DROP CONSTRAINT "FK_c289e23ab20343006e6479d14a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2034157d08bd2035dbd7fdc144"`);
        await queryRunner.query(`DROP TABLE "session_recharge"`);
        await queryRunner.query(`DROP TYPE "public"."session_recharge_statut_enum"`);
        await queryRunner.query(`DROP TYPE "public"."session_recharge_methodeauth_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5423388fc9fb8dff7e4dcc755"`);
        await queryRunner.query(`DROP TABLE "carte_rfid"`);
        await queryRunner.query(`DROP TYPE "public"."carte_rfid_statut_enum"`);
    }

}
