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

/** Runs `fn` inside a SQLite transaction: every write lands, or none. */
export const withTransaction = <T>(fn: () => T): T => db.transaction(fn)()

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
/* Tekki AI & real market data                                                */
/* -------------------------------------------------------------------------- */

/** One published close per share and per day (real BRVM data). */
export const QuoteHistory = createTable('quoteHistory', {
  historyId: { type: 'INTEGER', primary: true },
  symbol: { type: 'TEXT' },
  day: { type: 'TEXT' }, // YYYY-MM-DD
  priceFcfa: { type: 'REAL' },
})

/** Last successful BRVM snapshot, served when brvm.org is unreachable. */
export const MarketCache = createTable('marketCache', {
  cacheId: { type: 'INTEGER', primary: true },
  payloadJson: { type: 'TEXT' },
  fetchedAt: { type: 'TEXT' },
})

/**
 * Executed trades of a public profile, the single source for Tekki Analytics.
 * Seeded example profiles are flagged `isExample` and shown as such.
 */
export const SocialTrade = createTable('socialTrade', {
  tradeId: { type: 'INTEGER', primary: true },
  traderId: { type: 'TEXT' },
  symbol: { type: 'TEXT' },
  side: { type: 'TEXT' }, // 'BUY' | 'SELL'
  quantity: { type: 'INTEGER' },
  priceFcfa: { type: 'REAL' },
  executedAt: { type: 'TEXT' }, // ISO date
  isExample: { type: 'INTEGER' }, // 0 or 1
})

/** Metadata of each Tekki AI answer (no audio, no raw conversation). */
export const AIInteraction = createTable('aiInteraction', {
  interactionId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER', optional: true },
  task: { type: 'TEXT' },
  provider: { type: 'TEXT' },
  model: { type: 'TEXT' },
  language: { type: 'TEXT' },
  contextVersion: { type: 'TEXT' },
  sourcesJson: { type: 'TEXT' },
  guardrailTriggered: { type: 'INTEGER' },
  createdAt: { type: 'TEXT' },
})

sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_history_symbol_day ON quoteHistory(symbol, day)`
  .run()
sql`CREATE INDEX IF NOT EXISTS idx_social_trade ON socialTrade(traderId, executedAt)`
  .run()

/* -------------------------------------------------------------------------- */
/* Mock SGI (sandbox): data owned by the simulated SGI, not by TekkiTrade      */
/* -------------------------------------------------------------------------- */

export const MockSgiAccount = createTable('mockSgiAccount', {
  rowId: { type: 'INTEGER', primary: true },
  accountId: { type: 'TEXT' },
  userId: { type: 'INTEGER' },
  cashFcfa: { type: 'REAL' },
  createdAt: { type: 'TEXT' },
})

export const MockSgiOrder = createTable('mockSgiOrder', {
  rowId: { type: 'INTEGER', primary: true },
  orderId: { type: 'TEXT' },
  sgiReference: { type: 'TEXT' },
  accountId: { type: 'TEXT' },
  idempotencyKey: { type: 'TEXT' },
  symbol: { type: 'TEXT' },
  side: { type: 'TEXT' },
  orderType: { type: 'TEXT' },
  quantity: { type: 'REAL' },
  amountFcfa: { type: 'REAL', optional: true },
  limitPriceFcfa: { type: 'REAL', optional: true },
  referencePriceFcfa: { type: 'REAL' },
  filledQuantity: { type: 'REAL' },
  filledGrossFcfa: { type: 'REAL' },
  feesJson: { type: 'TEXT' },
  netAmountFcfa: { type: 'REAL' },
  status: { type: 'TEXT' },
  rejectionReason: { type: 'TEXT', optional: true },
  fractional: { type: 'INTEGER' },
  eventsJson: { type: 'TEXT' },
  fillPlanJson: { type: 'TEXT' },
  createdAt: { type: 'TEXT' },
  updatedAt: { type: 'TEXT' },
})

export const MockSgiPosition = createTable('mockSgiPosition', {
  rowId: { type: 'INTEGER', primary: true },
  accountId: { type: 'TEXT' },
  symbol: { type: 'TEXT' },
  quantity: { type: 'REAL' },
  averageCostFcfa: { type: 'REAL' },
})

export const MockSgiTransaction = createTable('mockSgiTransaction', {
  rowId: { type: 'INTEGER', primary: true },
  transactionId: { type: 'TEXT' },
  accountId: { type: 'TEXT' },
  type: { type: 'TEXT' },
  amountFcfa: { type: 'REAL' },
  orderId: { type: 'TEXT', optional: true },
  label: { type: 'TEXT' },
  at: { type: 'TEXT' },
})

sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_mock_sgi_account_user ON mockSgiAccount(userId)`
  .run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_mock_sgi_order_id ON mockSgiOrder(orderId)`
  .run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_mock_sgi_order_idem ON mockSgiOrder(accountId, idempotencyKey)`
  .run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_mock_sgi_position ON mockSgiPosition(accountId, symbol)`
  .run()

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
