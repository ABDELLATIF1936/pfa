import {
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @ApiPropertyOptional({ example: 'Dupont' })
  @IsString()
  nom?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Jean' })
  @IsString()
  prenom?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: '+33601020304' })
  @IsPhoneNumber(undefined, {
    message: 'Le numéro de téléphone doit être valide',
  })
  telephone?: string;

  @IsOptional()
  @ApiPropertyOptional({ enum: ['postpaid', 'wallet'] })
  @IsEnum(['postpaid', 'wallet'], { message: 'Le mode de paiement doit être postpaid ou wallet' })
  modePaiementDefaut?: 'postpaid' | 'wallet';

  // Email et motDePasse ont des workflows dédiés et ne sont jamais modifiables ici.
}