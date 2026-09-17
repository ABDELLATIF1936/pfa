import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGrilleTarifaireDto {
  @ApiPropertyOptional({ example: 0.35, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @IsOptional()
  prixParKwh?: number;

  @Type(() => Number)
  @ApiPropertyOptional({ example: 0.1, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @IsOptional()
  prixParMinute?: number;

  @IsDateString()
  @ApiProperty({ example: '2026-09-09T00:00:00.000Z', format: 'date-time' })
  dateEffective: string;

  @IsString()
  @ApiPropertyOptional({ example: 'Tarif standard', maxLength: 255 })
  @IsOptional()
  @MaxLength(255)
  libelle?: string;
}
