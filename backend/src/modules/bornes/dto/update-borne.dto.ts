import { PartialType } from '@nestjs/mapped-types';
import { OmitType } from '@nestjs/mapped-types';
import { CreateBorneDto } from './create-borne.dto';

// Le déplacement doit passer par un endpoint dédié PATCH /bornes/:id/deplacer.
export class UpdateBorneDto extends PartialType(
  OmitType(CreateBorneDto, ['siteId'] as const),
) {}
