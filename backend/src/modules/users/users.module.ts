import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personne } from './entities/personne.entity';
import { Administrateur } from './entities/administrateur.entity';
import { Client } from './entities/client.entity';
import { CarteRFID } from './entities/carte-rfid.entity';
import { UsersController } from './users.controller';
import { CarteRfidController } from './carte-rfid.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Personne, Administrateur, Client, CarteRFID]),
  ],
  controllers: [UsersController, CarteRfidController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
