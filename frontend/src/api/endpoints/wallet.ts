import api from '@/api/client'
import type { RechargeWalletPayload, RechargeResponse, WalletTransactionsResponse } from '@/features/wallet/types/wallet.types'

export async function rechargerWallet(payload: RechargeWalletPayload): Promise<RechargeResponse> {
  const { data } = await api.post<RechargeResponse>('/wallet/recharge', payload)
  return data
}

export async function getTransactionsWallet(filters: { page?: number; limit?: number } = {}): Promise<WalletTransactionsResponse> {
  const { data } = await api.get<WalletTransactionsResponse>('/wallet/transactions', { params: filters })
  return data
}