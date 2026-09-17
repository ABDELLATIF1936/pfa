import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BornesModule } from '../bornes/bornes.module';
import { UsersModule } from '../users/users.module';
import { OcppModule } from '../ocpp/ocpp.module';
import { SessionRecharge } from './entities/session-recharge.entity';
import { Vehicule } from './entities/vehicule.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionRecharge, Vehicule]),
    UsersModule,
    BornesModule,
    forwardRef(() => OcppModule),
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
