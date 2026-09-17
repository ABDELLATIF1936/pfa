import { PartialType } from '@nestjs/swagger';
import { CreateNiveauFideliteDto } from './create-niveau-fidelite.dto';

export class UpdateNiveauFideliteDto extends PartialType(CreateNiveauFideliteDto) {}
