import { IsOptional, IsUUID, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartSessionQrDto {
  @ApiProperty({ example: 'BORNE-001' })
  @IsString()
  @MinLength(1)
  identifiantBorne: string;

  @IsOptional()
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  vehiculeId?: string;
}
