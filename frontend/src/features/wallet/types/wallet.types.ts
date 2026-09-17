export type WalletTransactionType = 'recharge' | 'debit'

export interface TransactionWallet {
  id: string
  type: WalletTransactionType
  montant: number | string
  soldeAvant: number | string
  soldeApres: number | string
  dateTransaction: string
  description: string
}

export interface RechargeWalletPayload {
  montant: number
}

export interface RechargeResponse {
  nouveauSolde: number
  transactionId: string
}

export interface WalletTransactionsResponse {
  items: TransactionWallet[]
  page: number
  limit: number
  total: number
  totalPages: number
}