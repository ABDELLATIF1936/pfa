import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RechargeWalletDto } from './dto/recharge-wallet.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth('JWT-auth')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('recharge')
  @ApiOperation({ summary: 'Recharger le wallet (paiement simulé)' })
  recharge(@CurrentUser() user: { sub: string }, @Body() payload: RechargeWalletDto) {
    return this.walletService.recharge(user.sub, payload);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Lister les transactions wallet' })
  transactions(@CurrentUser() user: { sub: string }, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.walletService.findTransactions(user.sub, Number(page), Number(limit));
  }
}