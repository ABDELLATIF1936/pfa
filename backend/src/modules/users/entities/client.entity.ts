import { ChildEntity, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Personne } from './personne.entity';
import { SessionRecharge } from '../../sessions/entities/session-recharge.entity';
import { Vehicule } from '../../sessions/entities/vehicule.entity';

/**
 * Entité héritée 'Client' représentant un client utilisateur de la plateforme.
 * 
 * Stockée dans la table unique 'personne' avec la valeur discriminante 'client' dans la colonne 'type'.
 */
@ChildEntity('client')
export class Client extends Personne {
  @OneToMany(() => SessionRecharge, (session) => session.client)
  sessionsRecharge!: SessionRecharge[];

  @OneToMany(() => Vehicule, (vehicule) => vehicule.client)
  vehicules!: Vehicule[];

  @CreateDateColumn({ name: 'date_inscription', type: 'timestamp' })
  dateInscription!: Date;

  @Column({
    name: 'mode_paiement_defaut',
    type: 'enum',
    enum: ['postpaid', 'wallet'],
    default: 'postpaid',
  })
  modePaiementDefaut!: 'postpaid' | 'wallet';

  @Column({
    name: 'solde_wallet',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value), // Convertit le type de retour string de pg en number
    },
  })
  soldeWallet!: number;
}
