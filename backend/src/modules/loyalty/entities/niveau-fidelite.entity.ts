import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('niveau_fidelite')
export class NiveauFidelite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ name: 'seuil_points', type: 'int', default: 0 })
  seuilPoints: number;

  @Column({
    name: 'pourcentage_reduction',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  pourcentageReduction: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
