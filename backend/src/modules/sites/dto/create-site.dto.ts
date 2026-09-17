import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({ example: 'Paris Centre' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: '12 rue de la République' })
  @IsString()
  @IsNotEmpty()
  adresse: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  @IsNotEmpty()
  ville: string;

  @ApiProperty({ example: 48.8566, minimum: -90, maximum: 90 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 2.3522, minimum: -180, maximum: 180 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  longitude: number;
}
