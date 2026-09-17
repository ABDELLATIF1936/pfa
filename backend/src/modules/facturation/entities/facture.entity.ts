import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GrilleTarifaire } from '../../tarification/entities/grille-tarifaire.entity';
import { SessionRecharge } from '../../sessions/entities/session-recharge.entity';

export enum StatutPaiementFacture {
  EN_ATTENTE = 'en_attente',
  PAYEE = 'payee',
  ECHOUEE = 'echouee',
}

@Entity('facture')
export class Facture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  numero: string;

  @Column({ name: 'session_id', type: 'uuid', unique: true })
  sessionId: string;

  @ManyToOne(() => SessionRecharge, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'session_id' })
  session: SessionRecharge;

  @Column({ name: 'montant_total', type: 'decimal', precision: 10, scale: 2 })
  montantTotal: number;

  @Column({ name: 'grille_tarifaire_id', type: 'uuid' })
  grilleTarifaireId: string;

  @ManyToOne(() => GrilleTarifaire, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'grille_tarifaire_id' })
  grilleTarifaire: GrilleTarifaire;

  @CreateDateColumn({ name: 'date_emission', type: 'timestamp' })
  dateEmission: Date;

  @Column({
    name: 'statut_paiement',
    type: 'enum',
    enum: StatutPaiementFacture,
    default: StatutPaiementFacture.EN_ATTENTE,
  })
  // statutPaiement représente le statut métier de paiement de la facture.
  statutPaiement: StatutPaiementFacture;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
