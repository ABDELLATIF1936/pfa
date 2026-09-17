import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BornesModule } from '../bornes/bornes.module';
import { Borne } from '../bornes/entities/borne.entity';
import { Facture } from '../facturation/entities/facture.entity';
import { SessionRecharge } from '../sessions/entities/session-recharge.entity';
import { Site } from '../sites/entities/site.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    BornesModule,
    TypeOrmModule.forFeature([Borne, SessionRecharge, Facture, Site]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
