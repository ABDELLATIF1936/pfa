import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Facture } from '../../facturation/entities/facture.entity';
import { CompteFidelite } from './compte-fidelite.entity';
import { Recompense } from './recompense.entity';

export enum TypeOperationFidelite {
  GAIN = 'gain',
  ECHANGE = 'echange',
}

@Entity('historique_points_fidelite')
export class HistoriquePointsFidelite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'compte_fidelite_id', type: 'uuid' })
  compteFideliteId: string;

  @ManyToOne(() => CompteFidelite, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'compte_fidelite_id' })
  compteFidelite: CompteFidelite;

  @Column({ type: 'enum', enum: TypeOperationFidelite })
  type: TypeOperationFidelite;

  @Column({ type: 'int' })
  points: number;

  @Column({ name: 'facture_id', type: 'uuid', nullable: true })
  factureId?: string | null;

  @ManyToOne(() => Facture, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'facture_id' })
  facture?: Facture | null;

  @Column({ name: 'recompense_id', type: 'uuid', nullable: true })
  recompenseId?: string | null;

  @ManyToOne(() => Recompense, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recompense_id' })
  recompense?: Recompense | null;

  @CreateDateColumn({ name: 'date_operation', type: 'timestamp' })
  dateOperation: Date;

  @Column({ type: 'varchar', nullable: true })
  description?: string;
}
