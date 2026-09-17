import { IsNumber, Min } from 'class-validator';

export class RechargeWalletDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(10, { message: 'Le montant minimum de recharge est de 10 MAD' })
  montant: number;
}