import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SitesModule } from './modules/sites/sites.module';
import { BornesModule } from './modules/bornes/bornes.module';
import { ChargingStationsModule } from './modules/charging-stations/charging-stations.module';
import { ChargingSessionsModule } from './modules/charging-sessions/charging-sessions.module';
import { BillingModule } from './modules/billing/billing.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { OcppSimulatorModule } from './modules/ocpp-simulator/ocpp-simulator.module';
import { OcppModule } from './modules/ocpp/ocpp.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { VehiculesModule } from './modules/vehicules/vehicules.module';
import { TarificationModule } from './modules/tarification/tarification.module';
import { FacturationModule } from './modules/facturation/facturation.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { typeOrmConfigOptions } from './config/typeorm.config';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60,
        limit: 100,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot(typeOrmConfigOptions),
    PrismaModule,
    AuthModule,
    UsersModule,
    SitesModule,
    BornesModule,
    ChargingStationsModule,
    ChargingSessionsModule,
    BillingModule,
    PaymentsModule,
    LoyaltyModule,
    OcppSimulatorModule,
    OcppModule,
    SessionsModule,
    VehiculesModule,
    TarificationModule,
    FacturationModule,
    DashboardModule,
    WalletModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // Limite globale: 100 requêtes par fenêtre de 60 secondes et par client.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}