import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from '../../sites/entities/site.entity';
import { StatutBorne } from '../enums/statut-borne.enum';
import { SessionRecharge } from '../../sessions/entities/session-recharge.entity';

export enum TypeBorne {
  AC = 'AC',
  DC = 'DC',
}

export { StatutBorne } from '../enums/statut-borne.enum';

@Entity('borne')
export class Borne {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // L'identifiant est généré côté serveur pour éviter collisions et falsification OCPP/QR.
  @Index({ unique: true })
  @Column({ name: 'identifiant_unique', type: 'varchar' })
  identifiantUnique: string;

  @Column({ name: 'type_borne', type: 'enum', enum: TypeBorne })
  typeBorne: TypeBorne;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  puissance: number;

  @Column({
    type: 'enum',
    enum: StatutBorne,
    default: StatutBorne.DISPONIBLE,
  })
  statut: StatutBorne;

  @Column({ name: 'qr_code_url', type: 'varchar', nullable: true })
  qrCodeUrl?: string;

  @Column({ name: 'site_id', type: 'uuid' })
  siteId: string;

  @ManyToOne(() => Site, (site) => site.bornes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @OneToMany(() => SessionRecharge, (session) => session.borne)
  sessionsRecharge: SessionRecharge[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
