import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Grille applicable : actif = true et dateEffective la plus récente
 * antérieure ou égale à la date de la session concernée.
 */
@Entity('grille_tarifaire')
export class GrilleTarifaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'prix_par_kwh', type: 'decimal', precision: 10, scale: 4 })
  prixParKwh: number;

  @Column({
    name: 'prix_par_minute',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  prixParMinute?: number | null;

  @Column({ name: 'date_effective', type: 'timestamp' })
  dateEffective: Date;

  @Column({ type: 'varchar', nullable: true })
  libelle?: string | null;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
