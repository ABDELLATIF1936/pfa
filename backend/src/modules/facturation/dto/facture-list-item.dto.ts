import { ApiProperty } from '@nestjs/swagger';

export class FactureListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  numero: string;

  @ApiProperty()
  montantTotal: number;

  @ApiProperty()
  dateEmission: Date;

  @ApiProperty()
  statutPaiement: string;

  @ApiProperty({ nullable: true })
  session: {
    id: string;
    dateDebut: Date;
    dateFin?: Date | null;
    energieConsommee: number;
  } | null;
}
