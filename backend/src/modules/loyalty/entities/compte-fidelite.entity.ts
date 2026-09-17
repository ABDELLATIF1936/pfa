import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Personne } from '../../users/entities/personne.entity';
import { NiveauFidelite } from './niveau-fidelite.entity';

@Entity('compte_fidelite')
export class CompteFidelite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ name: 'client_id', type: 'uuid', unique: true })
  clientId: string;

  @OneToOne(() => Personne, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Personne;

  @Column({ name: 'niveau_actuel_id', type: 'uuid', nullable: true })
  niveauActuelId?: string | null;

  @ManyToOne(() => NiveauFidelite, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'niveau_actuel_id' })
  niveauActuel?: NiveauFidelite | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
