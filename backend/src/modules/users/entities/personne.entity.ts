import {
  Entity,
  TableInheritance,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';

/**
 * Entité abstraite de base 'Personne'
 * 
 * Pourquoi "Single Table Inheritance" (STI) ?
 * - Idéal lorsque les sous-classes partagent la grande majorité de leurs colonnes.
 * - Performance accrue : une seule table à interroger (pas de JOINs coûteux entre les tables).
 * - Simplicité des requêtes et de l'indexation.
 * - Le coût est d'avoir des colonnes spécifiques nullables pour les sous-classes (comme le matricule ou le solde).
 */
@Entity('personne')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Personne {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nom', type: 'varchar', nullable: false })
  nom: string;

  @Column({ name: 'prenom', type: 'varchar', nullable: false })
  prenom: string;

  @Index({ unique: true })
  @IsEmail({}, { message: 'Format de l\'adresse email invalide' })
  @Column({ name: 'email', type: 'varchar', nullable: false })
  email: string;

  @Exclude()
  @Column({ name: 'mot_de_passe', type: 'varchar', nullable: false })
  motDePasse: string;

  @Column({ name: 'telephone', type: 'varchar', nullable: true })
  telephone?: string;

  @Column({ name: 'photo_url', type: 'varchar', nullable: true })
  photoUrl?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
