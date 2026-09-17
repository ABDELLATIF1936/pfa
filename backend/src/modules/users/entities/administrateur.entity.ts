import { ChildEntity, Column } from 'typeorm';
import { Personne } from './personne.entity';

/**
 * Entité héritée 'Administrateur' représentant un utilisateur administrateur de la plateforme.
 * 
 * Stockée dans la table unique 'personne' avec la valeur discriminante 'administrateur' dans la colonne 'type'.
 */
@ChildEntity('administrateur')
export class Administrateur extends Personne {
  @Column({ name: 'matricule', type: 'varchar', nullable: true })
  matricule?: string;
}
