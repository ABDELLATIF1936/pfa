import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TypeBorne } from '../entities/borne.entity';

export class CreateBorneDto {
  @ApiProperty({ enum: TypeBorne })
  @IsEnum(TypeBorne)
  typeBorne: TypeBorne;

  @Type(() => Number)
  @ApiProperty({ example: 22, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  puissance: number;

  @IsUUID()
  @ApiProperty({ format: 'uuid' })
  siteId: string;
}
