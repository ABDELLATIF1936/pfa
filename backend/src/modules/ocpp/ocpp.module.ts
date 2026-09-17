import { forwardRef, Module } from '@nestjs/common';
import { BornesModule } from '../bornes/bornes.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { OcppServerService } from './ocpp-server.service';
import { FacturationModule } from '../facturation/facturation.module';

@Module({
  imports: [
    BornesModule,
    UsersModule,
    forwardRef(() => SessionsModule),
    FacturationModule,
  ],
  providers: [OcppServerService],
  exports: [OcppServerService],
})
export class OcppModule {}
