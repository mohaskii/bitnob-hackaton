import { createTable, db, type Row } from '@01edu/db'

export { createTable, db }

export const sqlQuery = <
  R extends { [x: string]: unknown } | undefined = Record<string, unknown>,
>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  const query = strings.join('?')
  const stmt = db.prepare(query)
  return {
    get: (...args: unknown[]) =>
      (args.length
        ? stmt.get(...(args as any[]))
        : stmt.get(...(values as any[]))) as R | undefined,
    all: (...args: unknown[]) =>
      (args.length
        ? stmt.all(...(args as any[]))
        : stmt.all(...(values as any[]))) as R[],
    run: (...args: unknown[]) =>
      args.length
        ? stmt.run(...(args as any[]))
        : stmt.run(...(values as any[])),
    value: (...args: unknown[]) =>
      args.length
        ? stmt.value(...(args as any[]))
        : stmt.value(...(values as any[])),
  }
}

export const sql = sqlQuery

/* -------------------------------------------------------------------------- */
/* SQLite Tables Definition (via @01edu/db)                                    */
/* -------------------------------------------------------------------------- */

export const User = createTable('user', {
  userId: { type: 'INTEGER', primary: true },
  email: { type: 'TEXT' },
  login: { type: 'TEXT' },
  phone: { type: 'TEXT', optional: true },
  password: { type: 'BLOB' },
  bitnobCustomerId: { type: 'TEXT', optional: true },
  createdAt: { type: 'REAL' },
})

export const Wallet = createTable('wallet', {
  walletId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  balanceFcfa: { type: 'REAL' },
  balanceUsdt: { type: 'REAL' },
  updatedAt: { type: 'REAL' },
})

export const Stock = createTable('stock', {
  stockId: { type: 'INTEGER', primary: true },
  symbol: { type: 'TEXT' },
  name: { type: 'TEXT' },
  sector: { type: 'TEXT' },
  priceFcfa: { type: 'REAL' },
  changePercent: { type: 'REAL' },
  historyJson: { type: 'TEXT', optional: true },
  logoColor: { type: 'TEXT', optional: true },
  logoText: { type: 'TEXT', optional: true },
  updatedAt: { type: 'REAL' },
})

export const FractionalShare = createTable('fractionalShare', {
  shareId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  symbol: { type: 'TEXT' },
  quantity: { type: 'REAL' },
  averageBuyPriceFcfa: { type: 'REAL' },
  updatedAt: { type: 'REAL' },
})

export const Order = createTable('orderRecord', {
  orderId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  symbol: { type: 'TEXT' },
  action: { type: 'TEXT' }, // 'ACHAT' | 'VENTE'
  amountFcfa: { type: 'REAL' },
  sharesFilled: { type: 'REAL' },
  priceFcfa: { type: 'REAL' },
  status: { type: 'TEXT' }, // 'COMPLETED' | 'PENDING' | 'CANCELLED'
  createdAt: { type: 'REAL' },
})

export const Trader = createTable('trader', {
  traderId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER', optional: true },
  name: { type: 'TEXT' },
  handle: { type: 'TEXT' },
  avatarUrl: { type: 'TEXT' },
  verified: { type: 'INTEGER' }, // 0 or 1
  returnPercent: { type: 'REAL' },
  timeframe: { type: 'TEXT' },
  copiersCount: { type: 'INTEGER' },
  winRate: { type: 'REAL' },
  riskLevel: { type: 'TEXT' }, // 'Faible' | 'Modéré' | 'Élevé'
  badge: { type: 'TEXT', optional: true },
})

export const CopyContract = createTable('copyContract', {
  contractId: { type: 'INTEGER', primary: true },
  copierUserId: { type: 'INTEGER' },
  traderId: { type: 'INTEGER' },
  allocatedFcfa: { type: 'REAL' },
  stopLossPercent: { type: 'REAL' },
  copyOpenTrades: { type: 'INTEGER' }, // 0 or 1
  status: { type: 'TEXT' }, // 'ACTIVE' | 'PAUSED' | 'CLOSED'
  createdAt: { type: 'REAL' },
})

export const BitnobTransaction = createTable('bitnobTransaction', {
  transactionId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  reference: { type: 'TEXT' },
  type: { type: 'TEXT' }, // 'LIGHTNING_INVOICE' | 'USDT_DEPOSIT' | 'MOMO_PAYOUT' | 'CARD_TOPUP'
  amountFcfa: { type: 'REAL' },
  amountUsdt: { type: 'REAL' },
  bitnobId: { type: 'TEXT', optional: true },
  status: { type: 'TEXT' }, // 'PENDING' | 'SUCCESS' | 'FAILED'
  metadata: { type: 'TEXT', optional: true },
  createdAt: { type: 'REAL' },
})

export const VirtualCard = createTable('virtualCard', {
  cardId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  bitnobCardId: { type: 'TEXT' },
  cardBrand: { type: 'TEXT' }, // 'VISA'
  maskedPan: { type: 'TEXT', optional: true },
  cardStatus: { type: 'TEXT' }, // 'ACTIVE' | 'FROZEN' | 'TERMINATED'
  balanceUsdt: { type: 'REAL' },
  createdAt: { type: 'REAL' },
})

export const SocialPost = createTable('socialPost', {
  postId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  authorName: { type: 'TEXT' },
  authorHandle: { type: 'TEXT' },
  avatarUrl: { type: 'TEXT' },
  verified: { type: 'INTEGER' }, // 0 or 1
  content: { type: 'TEXT' },
  symbol: { type: 'TEXT', optional: true },
  tradeAction: { type: 'TEXT', optional: true },
  priceFcfa: { type: 'REAL', optional: true },
  changePercent: { type: 'REAL', optional: true },
  sentiment: { type: 'TEXT', optional: true },
  likesCount: { type: 'INTEGER' },
  commentsCount: { type: 'INTEGER' },
  copiersCount: { type: 'INTEGER' },
  createdAt: { type: 'REAL' },
})

/* -------------------------------------------------------------------------- */
/* Database Indexes                                                           */
/* -------------------------------------------------------------------------- */

sql`CREATE INDEX IF NOT EXISTS idx_user_email ON user(email)`.run()
sql`CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet(userId)`.run()
sql`CREATE INDEX IF NOT EXISTS idx_stock_symbol ON stock(symbol)`.run()
sql`CREATE INDEX IF NOT EXISTS idx_share_user_symbol ON fractionalShare(userId, symbol)`
  .run()
sql`CREATE INDEX IF NOT EXISTS idx_order_user ON orderRecord(userId)`.run()
sql`CREATE INDEX IF NOT EXISTS idx_copy_copier ON copyContract(copierUserId)`
  .run()
sql`CREATE INDEX IF NOT EXISTS idx_tx_reference ON bitnobTransaction(reference)`
  .run()
sql`CREATE INDEX IF NOT EXISTS idx_card_user ON virtualCard(userId)`.run()
sql`CREATE INDEX IF NOT EXISTS idx_post_created ON socialPost(createdAt DESC)`
  .run()

/* -------------------------------------------------------------------------- */
/* Type Exports for Business Logic                                            */
/* -------------------------------------------------------------------------- */

export type UserRow = Row<typeof User.properties>
export type WalletRow = Row<typeof Wallet.properties>
export type StockRow = Row<typeof Stock.properties>
export type FractionalShareRow = Row<typeof FractionalShare.properties>
export type OrderRow = Row<typeof Order.properties>
export type TraderRow = Row<typeof Trader.properties>
export type CopyContractRow = Row<typeof CopyContract.properties>
export type BitnobTransactionRow = Row<typeof BitnobTransaction.properties>
export type VirtualCardRow = Row<typeof VirtualCard.properties>
export type SocialPostRow = Row<typeof SocialPost.properties>
