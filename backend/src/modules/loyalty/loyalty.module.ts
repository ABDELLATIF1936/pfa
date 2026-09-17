import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facture } from '../facturation/entities/facture.entity';
import { CompteFidelite } from './entities/compte-fidelite.entity';
import { HistoriquePointsFidelite } from './entities/historique-points-fidelite.entity';
import { NiveauFidelite } from './entities/niveau-fidelite.entity';
import { Recompense } from './entities/recompense.entity';
import { FideliteController } from './fidelite.controller';
import { FideliteService } from './fidelite.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompteFidelite,
      NiveauFidelite,
      Recompense,
      HistoriquePointsFidelite,
      Facture,
    ]),
  ],
  controllers: [FideliteController],
  providers: [FideliteService],
  exports: [FideliteService],
})
export class LoyaltyModule {}
