import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssocierCarteDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  clientId: string;
}
