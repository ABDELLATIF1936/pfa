import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehiculeDto {
  @ApiProperty({ example: 'AB-123-CD' })
  @IsString()
  @MinLength(1)
  immatriculation: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Tesla' })
  @IsString()
  marque?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Model 3' })
  @IsString()
  modele?: string;
}
