import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail({}, { message: "L'adresse email doit être valide" })
  email: string;

  @IsString()
  @ApiProperty({ example: 'P@ssword123', minLength: 8 })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  motDePasse: string;
}

