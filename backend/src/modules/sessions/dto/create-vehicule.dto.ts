import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVehiculeDto {
  @IsString()
  @MinLength(1)
  immatriculation: string;

  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @IsString()
  modele?: string;
}
