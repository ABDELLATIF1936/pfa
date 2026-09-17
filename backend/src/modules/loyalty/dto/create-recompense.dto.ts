import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateRecompenseDto {
  @ApiProperty({ example: 'Charge gratuite 30 min' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 250 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  coutPoints: number;

  @ApiPropertyOptional({ example: 'Réduction de 30 minutes de charge' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
