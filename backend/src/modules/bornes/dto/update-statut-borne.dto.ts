import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatutBorne } from '../enums/statut-borne.enum';

export class UpdateStatutBorneDto {
  @ApiProperty({ enum: StatutBorne })
  @IsEnum(StatutBorne)
  statut: StatutBorne;
}
