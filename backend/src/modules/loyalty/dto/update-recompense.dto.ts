import { PartialType } from '@nestjs/swagger';
import { CreateRecompenseDto } from './create-recompense.dto';

export class UpdateRecompenseDto extends PartialType(CreateRecompenseDto) {}
