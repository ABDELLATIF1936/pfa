import {
  Column,
  Check,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Borne } from '../../bornes/entities/borne.entity';

@Entity('site')
@Check('CHK_site_latitude', '"latitude" BETWEEN -90 AND 90')
@Check('CHK_site_longitude', '"longitude" BETWEEN -180 AND 180')
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nom: string;

  @Column({ type: 'varchar' })
  adresse: string;

  @Index()
  @Column({ type: 'varchar' })
  ville: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  /**
   * RESTRICT conserve la traçabilité des bornes et de leurs sessions historiques;
   * CASCADE pourrait les supprimer implicitement avec le site.
   * Le modèle Borne sera enrichi à la tâche 2.2.
   */
  @OneToMany(() => Borne, (borne) => borne.site, {
    cascade: false,
    onDelete: 'RESTRICT',
  })
  bornes: Borne[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
