import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../users/entities/client.entity';
import { Vehicule } from '../sessions/entities/vehicule.entity';
import { VehiculesController } from './vehicules.controller';
import { VehiculesService } from './vehicules.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicule, Client])],
  controllers: [VehiculesController],
  providers: [VehiculesService],
  exports: [VehiculesService],
})
export class VehiculesModule {}
