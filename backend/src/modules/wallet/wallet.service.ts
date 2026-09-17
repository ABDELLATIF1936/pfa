import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../users/entities/client.entity';
import { RechargeWalletDto } from './dto/recharge-wallet.dto';
import { WalletTransaction, WalletTransactionType } from './entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,
    @InjectRepository(WalletTransaction) private readonly transactionRepository: Repository<WalletTransaction>,
  ) {}

  async recharge(clientId: string, payload: RechargeWalletDto) {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client introuvable');

    const montant = Number(payload.montant);
    if (!Number.isFinite(montant) || montant < 10) {
      throw new BadRequestException('Le montant minimum de recharge est de 10 MAD');
    }
    const soldeAvant = Number(client.soldeWallet ?? 0);
    const soldeApres = Number((soldeAvant + montant).toFixed(2));
    client.soldeWallet = soldeApres;
    await this.clientRepository.save(client);

    const transaction = await this.transactionRepository.save(this.transactionRepository.create({
      clientId,
      type: WalletTransactionType.RECHARGE,
      montant,
      soldeAvant,
      soldeApres,
      dateTransaction: new Date(),
      description: 'Recharge wallet - paiement simulé',
    }));

    return { nouveauSolde: soldeApres, transactionId: transaction.id };
  }

  async findTransactions(clientId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    const [items, total] = await this.transactionRepository.findAndCount({
      where: { clientId },
      order: { dateTransaction: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
    return { items, page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) };
  }
}