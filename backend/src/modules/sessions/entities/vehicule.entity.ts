import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../users/entities/client.entity';
import { SessionRecharge } from './session-recharge.entity';

@Entity('vehicule')
export class Vehicule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'immatriculation', type: 'varchar', unique: true })
  immatriculation: string;

  @Column({ name: 'marque', type: 'varchar', nullable: true })
  marque?: string;

  @Column({ name: 'modele', type: 'varchar', nullable: true })
  modele?: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.vehicules, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => SessionRecharge, (session) => session.vehicule)
  sessionsRecharge: SessionRecharge[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
