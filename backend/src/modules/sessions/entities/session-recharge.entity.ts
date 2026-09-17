import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Borne } from '../../bornes/entities/borne.entity';
import { Client } from '../../users/entities/client.entity';
import { Vehicule } from './vehicule.entity';

export enum MethodeAuthSession {
  RFID = 'rfid',
  QRCODE = 'qrcode',
}

export enum StatutSessionRecharge {
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  INTERRUPPUE = 'interrompue',
  EN_PANNE = 'en_panne',
}

@Entity('session_recharge')
export class SessionRecharge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // OCPP attend un entier simple pour transactionId, donc on garde un identifiant numérique
  // auto-incrémenté côté base, plus stable et compatible avec les messages suivants MeterValues/StopTransaction.
  @Index({ unique: true })
  @Generated('increment')
  @Column({ name: 'ocpp_transaction_id', type: 'int', unique: true })
  ocppTransactionId: number;

  @Column({ name: 'date_debut', type: 'timestamp' })
  dateDebut: Date;

  @Column({ name: 'date_fin', type: 'timestamp', nullable: true })
  dateFin?: Date | null;

  @Column({
    name: 'energie_consommee',
    type: 'decimal',
    precision: 10,
    scale: 3,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value ?? '0'),
    },
  })
  energieConsommee: number;

  @Column({
    type: 'enum',
    enum: MethodeAuthSession,
    default: MethodeAuthSession.RFID,
  })
  methodeAuth: MethodeAuthSession;

  @Column({
    type: 'enum',
    enum: StatutSessionRecharge,
    default: StatutSessionRecharge.EN_COURS,
  })
  statut: StatutSessionRecharge;

  @Column({ name: 'borne_id', type: 'uuid' })
  borneId: string;

  @ManyToOne(() => Borne, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'borne_id' })
  borne: Borne;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'vehicule_id', type: 'uuid', nullable: true })
  vehiculeId?: string | null;

  @ManyToOne(() => Vehicule, (vehicule) => vehicule.sessionsRecharge, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'vehicule_id' })
  vehicule?: Vehicule | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
