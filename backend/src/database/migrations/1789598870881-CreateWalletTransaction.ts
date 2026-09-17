import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWalletTransaction1789598870881 implements MigrationInterface {
    name = 'CreateWalletTransaction1789598870881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicule" DROP CONSTRAINT "FK_vehicule_client"`);
        await queryRunner.query(`ALTER TABLE "session_recharge" DROP CONSTRAINT "FK_session_recharge_vehicule"`);
        await queryRunner.query(`ALTER TABLE "facture" DROP CONSTRAINT "FK_facture_session"`);
        await queryRunner.query(`ALTER TABLE "facture" DROP CONSTRAINT "FK_facture_grille_tarifaire"`);
        await queryRunner.query(`ALTER TABLE "compte_fidelite" DROP CONSTRAINT "FK_compte_fidelite_personne"`);
        await queryRunner.query(`ALTER TABLE "compte_fidelite" DROP CONSTRAINT "FK_compte_fidelite_niveau"`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" DROP CONSTRAINT "FK_historique_points_fidelite_compte"`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" DROP CONSTRAINT "FK_historique_points_fidelite_facture"`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" DROP CONSTRAINT "FK_historique_points_fidelite_recompense"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_grille_tarifaire_date_effective"`);
        await queryRunner.query(`CREATE TYPE "public"."paiement_statut_enum" AS ENUM('en_attente', 'reussi', 'echoue')`);
        await queryRunner.query(`CREATE TABLE "paiement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "facture_id" uuid NOT NULL, "montant" numeric(10,2) NOT NULL, "statut" "public"."paiement_statut_enum" NOT NULL DEFAULT 'en_attente', "date_creation" TIMESTAMP NOT NULL DEFAULT now(), "date_execution" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL, CONSTRAINT "UQ_f15e4f97d78a7b758caad695fa7" UNIQUE ("facture_id"), CONSTRAINT "PK_decd14b2547ef2439fe89652b06" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cebb7e78341996ad87102de6cf" ON "paiement"  ("type") `);
        await queryRunner.query(`CREATE TYPE "public"."wallet_transaction_type_enum" AS ENUM('recharge', 'debit')`);
        await queryRunner.query(`CREATE TABLE "wallet_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "client_id" uuid NOT NULL, "type" "public"."wallet_transaction_type_enum" NOT NULL, "montant" numeric(10,2) NOT NULL, "solde_avant" numeric(10,2) NOT NULL, "solde_apres" numeric(10,2) NOT NULL, "date_transaction" TIMESTAMP NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_62a01b9c3a734b96a08c621b371" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vehicule" ADD CONSTRAINT "FK_aa2b8e316612e13be08d7058659" FOREIGN KEY ("client_id") REFERENCES "personne"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_recharge" ADD CONSTRAINT "FK_9be41cc59f971fd6bb00d932dee" FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "facture" ADD CONSTRAINT "FK_8abf26921d52f62ffed4aef7ee4" FOREIGN KEY ("session_id") REFERENCES "session_recharge"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "facture" ADD CONSTRAINT "FK_fdac7a65fff89efd3d2f885a9f7" FOREIGN KEY ("grille_tarifaire_id") REFERENCES "grille_tarifaire"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "compte_fidelite" ADD CONSTRAINT "FK_24efbd8eb20bbb03c5bc74e2cf9" FOREIGN KEY ("client_id") REFERENCES "personne"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "compte_fidelite" ADD CONSTRAINT "FK_ccb5209338f9c8ea8492dec71d3" FOREIGN KEY ("niveau_actuel_id") REFERENCES "niveau_fidelite"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" ADD CONSTRAINT "FK_a5256438b5c09fa59b05bbcb970" FOREIGN KEY ("compte_fidelite_id") REFERENCES "compte_fidelite"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" ADD CONSTRAINT "FK_2db8c7c7b3cbafa4fd4031322bc" FOREIGN KEY ("facture_id") REFERENCES "facture"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" ADD CONSTRAINT "FK_ac1992b49d96b71374207045047" FOREIGN KEY ("recompense_id") REFERENCES "recompense"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "paiement" ADD CONSTRAINT "FK_f15e4f97d78a7b758caad695fa7" FOREIGN KEY ("facture_id") REFERENCES "facture"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_a68dd6072986f8917e5d39ee2c6" FOREIGN KEY ("client_id") REFERENCES "personne"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_a68dd6072986f8917e5d39ee2c6"`);
        await queryRunner.query(`ALTER TABLE "paiement" DROP CONSTRAINT "FK_f15e4f97d78a7b758caad695fa7"`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" DROP CONSTRAINT "FK_ac1992b49d96b71374207045047"`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" DROP CONSTRAINT "FK_2db8c7c7b3cbafa4fd4031322bc"`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" DROP CONSTRAINT "FK_a5256438b5c09fa59b05bbcb970"`);
        await queryRunner.query(`ALTER TABLE "compte_fidelite" DROP CONSTRAINT "FK_ccb5209338f9c8ea8492dec71d3"`);
        await queryRunner.query(`ALTER TABLE "compte_fidelite" DROP CONSTRAINT "FK_24efbd8eb20bbb03c5bc74e2cf9"`);
        await queryRunner.query(`ALTER TABLE "facture" DROP CONSTRAINT "FK_fdac7a65fff89efd3d2f885a9f7"`);
        await queryRunner.query(`ALTER TABLE "facture" DROP CONSTRAINT "FK_8abf26921d52f62ffed4aef7ee4"`);
        await queryRunner.query(`ALTER TABLE "session_recharge" DROP CONSTRAINT "FK_9be41cc59f971fd6bb00d932dee"`);
        await queryRunner.query(`ALTER TABLE "vehicule" DROP CONSTRAINT "FK_aa2b8e316612e13be08d7058659"`);
        await queryRunner.query(`DROP TABLE "wallet_transaction"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transaction_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cebb7e78341996ad87102de6cf"`);
        await queryRunner.query(`DROP TABLE "paiement"`);
        await queryRunner.query(`DROP TYPE "public"."paiement_statut_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_grille_tarifaire_date_effective" ON "grille_tarifaire" USING btree ("date_effective") `);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" ADD CONSTRAINT "FK_historique_points_fidelite_recompense" FOREIGN KEY ("recompense_id") REFERENCES "recompense"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" ADD CONSTRAINT "FK_historique_points_fidelite_facture" FOREIGN KEY ("facture_id") REFERENCES "facture"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historique_points_fidelite" ADD CONSTRAINT "FK_historique_points_fidelite_compte" FOREIGN KEY ("compte_fidelite_id") REFERENCES "compte_fidelite"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "compte_fidelite" ADD CONSTRAINT "FK_compte_fidelite_niveau" FOREIGN KEY ("niveau_actuel_id") REFERENCES "niveau_fidelite"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "compte_fidelite" ADD CONSTRAINT "FK_compte_fidelite_personne" FOREIGN KEY ("client_id") REFERENCES "personne"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "facture" ADD CONSTRAINT "FK_facture_grille_tarifaire" FOREIGN KEY ("grille_tarifaire_id") REFERENCES "grille_tarifaire"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "facture" ADD CONSTRAINT "FK_facture_session" FOREIGN KEY ("session_id") REFERENCES "session_recharge"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_recharge" ADD CONSTRAINT "FK_session_recharge_vehicule" FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicule" ADD CONSTRAINT "FK_vehicule_client" FOREIGN KEY ("client_id") REFERENCES "personne"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
