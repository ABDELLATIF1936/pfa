import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { TarificationModule } from '../tarification/tarification.module';
import { SessionRecharge } from '../sessions/entities/session-recharge.entity';
import { Client } from '../users/entities/client.entity';
import { Facture } from './entities/facture.entity';
import { FacturationService } from './facturation.service';
import { FacturePdfService } from './facture-pdf.service';
import { FacturesController } from './factures.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Facture, SessionRecharge, Client]),
    LoyaltyModule,
    TarificationModule,
  ],
  controllers: [FacturesController],
  providers: [FacturationService, FacturePdfService],
  exports: [FacturationService, FacturePdfService],
})
export class FacturationModule {}
