import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object (DTO) pour la création d'un Administrateur.
 */
export class CreateAdministrateurDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  nom: string;

  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  prenom: string;

  @IsEmail({}, { message: 'L\'adresse email doit être valide' })
  @IsNotEmpty({ message: 'L\'adresse email est obligatoire' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  motDePasse: string;

  @IsPhoneNumber(undefined, { message: 'Le numéro de téléphone doit être valide' })
  @IsOptional()
  telephone?: string;

  @IsString({ message: 'Le matricule doit être une chaîne de caractères' })
  @IsOptional()
  matricule?: string;
}
