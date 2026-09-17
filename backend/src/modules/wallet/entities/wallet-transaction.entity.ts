import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from '../../users/entities/client.entity';

export enum WalletTransactionType {
  RECHARGE = 'recharge',
  DEBIT = 'debit',
}

@Entity('wallet_transaction')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'enum', enum: WalletTransactionType })
  type: WalletTransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;

  @Column({ name: 'solde_avant', type: 'decimal', precision: 10, scale: 2 })
  soldeAvant: number;

  @Column({ name: 'solde_apres', type: 'decimal', precision: 10, scale: 2 })
  soldeApres: number;

  @Column({ name: 'date_transaction', type: 'timestamp' })
  dateTransaction: Date;

  @Column({ type: 'varchar' })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}