import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionRecharge } from '../sessions/entities/session-recharge.entity';
import { Site } from '../sites/entities/site.entity';
import { Borne } from './entities/borne.entity';
import { BornesController } from './bornes.controller';
import { BornesGateway } from './bornes.gateway';
import { BornesService } from './bornes.service';
import { QrCodeService } from './qrcode.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Borne, Site, SessionRecharge]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') as any,
        },
      }),
    }),
  ],
  controllers: [BornesController],
  providers: [BornesService, QrCodeService, BornesGateway, WsJwtGuard],
  exports: [BornesService, BornesGateway],
})
export class BornesModule {}
