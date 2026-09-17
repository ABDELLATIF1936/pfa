import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../users/entities/client.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, WalletTransaction])],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}