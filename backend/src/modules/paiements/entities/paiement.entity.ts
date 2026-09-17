import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { Facture } from '../../facturation/entities/facture.entity';

export enum StatutPaiement {
  EN_ATTENTE = 'en_attente',
  REUSSI = 'reussi',
  ECHOUE = 'echoue',
}

@Entity('paiement')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Paiement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'facture_id', type: 'uuid', unique: true })
  factureId: string;

  @ManyToOne(() => Facture, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'facture_id' })
  facture: Facture;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;

  @Column({ type: 'enum', enum: StatutPaiement, default: StatutPaiement.EN_ATTENTE })
  statut: StatutPaiement;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamp' })
  dateCreation: Date;

  @Column({ name: 'date_execution', type: 'timestamp', nullable: true })
  dateExecution?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
