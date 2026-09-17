import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateGrilleTarifaireDto } from './create-grille-tarifaire.dto';

export class UpdateGrilleTarifaireDto extends PartialType(
  CreateGrilleTarifaireDto,
) {
  @IsBoolean()
  @IsOptional()
  actif?: boolean;
}
