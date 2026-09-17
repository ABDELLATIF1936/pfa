import { IsString, MinLength, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCarteRfidDto {
  @ApiPropertyOptional({ example: 'RFID-0001' })
  @IsString()
  @MinLength(1)
  @IsOptional()
  identifiantUnique?: string;

  @IsUUID()
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  clientId?: string;
}
