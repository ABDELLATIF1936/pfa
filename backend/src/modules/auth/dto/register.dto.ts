import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  nom: string;

  @IsString()
  @ApiProperty({ example: 'Jean' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  prenom: string;

  @IsEmail({}, { message: "L'adresse email doit être valide" })
  @ApiProperty({ example: 'jean.dupont@example.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'P@ssword123', minLength: 8 })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  motDePasse: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '+33601020304' })
  @IsPhoneNumber(undefined, {
    message: 'Le numéro de téléphone doit être valide',
  })
  telephone?: string;
}
