import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarificationController } from './tarification.controller';
import { GrilleTarifaire } from './entities/grille-tarifaire.entity';
import { TarificationService } from './tarification.service';

@Module({
  imports: [TypeOrmModule.forFeature([GrilleTarifaire])],
  controllers: [TarificationController],
  providers: [TarificationService],
  exports: [TarificationService],
})
export class TarificationModule {}
