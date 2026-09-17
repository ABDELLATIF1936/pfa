import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength, IsEnum, IsNumber, Min } from 'class-validator';

/**
 * Data Transfer Object (DTO) pour la création d'un Client.
 */
export class CreateClientDto {
  @ApiProperty({ example: 'Dupont' })
  @ApiProperty({ example: 'Dupont' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  nom: string;

  @ApiProperty({ example: 'Jean' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  prenom: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  @IsEmail({}, { message: 'L\'adresse email doit être valide' })
  @IsNotEmpty({ message: 'L\'adresse email est obligatoire' })
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  motDePasse: string;

  @ApiPropertyOptional({ example: '+33601020304' })
  @IsPhoneNumber(undefined, { message: 'Le numéro de téléphone doit être valide' })
  @IsOptional()
  telephone?: string;

  @ApiPropertyOptional({ example: 'wallet', enum: ['postpaid', 'wallet'] })
  @IsEnum(['postpaid', 'wallet'], { message: 'Le mode de paiement par défaut doit être postpaid ou wallet' })
  @IsOptional()
  modePaiementDefaut?: 'postpaid' | 'wallet';

  @ApiPropertyOptional({ example: 25.5, minimum: 0 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Le solde du portefeuille doit être un nombre' })
  @Min(0, { message: 'Le solde du portefeuille ne peut pas être négatif' })
  @IsOptional()
  soldeWallet?: number;
}
