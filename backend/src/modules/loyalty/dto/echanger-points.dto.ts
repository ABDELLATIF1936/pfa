import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class EchangerPointsDto {
  @ApiProperty({ description: 'Identifiant de la récompense à échanger' })
  @IsNotEmpty()
  @IsUUID()
  recompenseId: string;
}
