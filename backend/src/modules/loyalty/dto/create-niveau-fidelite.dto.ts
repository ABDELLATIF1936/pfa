import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNiveauFideliteDto {
  @ApiProperty({ example: 'Argent' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 500 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  seuilPoints: number;

  @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  pourcentageReduction?: number;
}
