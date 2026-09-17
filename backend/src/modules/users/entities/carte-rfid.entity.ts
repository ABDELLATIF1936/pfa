import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';

export enum StatutCarteRFID {
  ACTIVE = 'active',
  BLOQUEE = 'bloquee',
  PERDUE = 'perdue',
  DESACTIVEE = 'desactivee',
}

@Entity('carte_rfid')
export class CarteRFID {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'identifiant_unique', type: 'varchar' })
  identifiantUnique: string;

  @Column({
    type: 'enum',
    enum: StatutCarteRFID,
    default: StatutCarteRFID.ACTIVE,
  })
  statut: StatutCarteRFID;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @CreateDateColumn({ name: 'date_activation', type: 'timestamp' })
  dateActivation: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
