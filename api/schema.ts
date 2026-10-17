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

/**
 * Runs `fn` inside a SQLite transaction: either every write lands, or none.
 */
export const withTransaction = <T>(fn: () => T): T => db.transaction(fn)()

/* -------------------------------------------------------------------------- */
/* SQLite Tables Definition (via @01edu/db)                                    */
/* -------------------------------------------------------------------------- */

export const User = createTable('user', {
  userId: { type: 'INTEGER', primary: true },
  email: { type: 'TEXT' },
  login: { type: 'TEXT' },
  phone: { type: 'TEXT', optional: true },
  passwordHash: { type: 'BLOB' },
  passwordSalt: { type: 'BLOB' },
  isGuest: { type: 'INTEGER' }, // 0 or 1
  bitnobCustomerId: { type: 'TEXT', optional: true },
  createdAt: { type: 'REAL' },
})

/** Latest delayed BRVM quote per listed share. */
export const Stock = createTable('stock', {
  stockId: { type: 'INTEGER', primary: true },
  symbol: { type: 'TEXT' },
  name: { type: 'TEXT' },
  priceFcfa: { type: 'REAL' },
  changePercent: { type: 'REAL' },
  updatedAt: { type: 'REAL' },
})

/** One published close per share and per day, used for sparklines. */
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

/** Practice account: fictitious money, real delayed prices. */
export const PaperAccount = createTable('paperAccount', {
  accountId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  cashFcfa: { type: 'REAL' },
  startingCashFcfa: { type: 'REAL' },
  realizedPnlFcfa: { type: 'REAL' },
  feesPaidFcfa: { type: 'REAL' },
  updatedAt: { type: 'REAL' },
})

export const PaperPosition = createTable('paperPosition', {
  positionId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  symbol: { type: 'TEXT' },
  quantity: { type: 'INTEGER' }, // BRVM shares trade as whole units
  averageCostFcfa: { type: 'REAL' }, // per share, buy fees included
  updatedAt: { type: 'REAL' },
})

export const PaperOrder = createTable('paperOrder', {
  orderId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  symbol: { type: 'TEXT' },
  side: { type: 'TEXT' }, // 'BUY' | 'SELL'
  quantity: { type: 'INTEGER' },
  priceFcfa: { type: 'REAL' },
  grossFcfa: { type: 'REAL' },
  feesJson: { type: 'TEXT' },
  totalFeesFcfa: { type: 'REAL' },
  netFcfa: { type: 'REAL' }, // cash debited (BUY) or credited (SELL)
  realizedPnlFcfa: { type: 'REAL', optional: true },
  sgiId: { type: 'TEXT' },
  quoteTime: { type: 'TEXT' },
  status: { type: 'TEXT' }, // 'SIMULATED_FILLED'
  createdAt: { type: 'REAL' },
})

/**
 * Funding of a securities account at the partner SGI through Bitnob:
 * the investor sends BTC (Lightning) or a stablecoin, Bitnob converts and pays
 * XOF to the SGI's collection wallet with the investor's reference.
 * TekkiTrade orchestrates and tracks; it never holds the funds.
 */
export const FundingRequest = createTable('fundingRequest', {
  fundingId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  sgiId: { type: 'TEXT' },
  reference: { type: 'TEXT' },
  mode: { type: 'TEXT' }, // 'simulation' | 'sandbox' | 'live'
  asset: { type: 'TEXT' }, // 'USDT' | 'USDC' | 'BTC'
  senderName: { type: 'TEXT' }, // required by Bitnob for XOF payouts
  senderCountry: { type: 'TEXT' }, // ISO alpha-2 country of residence
  amountFcfa: { type: 'REAL' }, // XOF expected at the SGI
  cryptoAmount: { type: 'TEXT' },
  rate: { type: 'REAL' },
  bitnobFeesFcfa: { type: 'REAL' },
  quoteId: { type: 'TEXT', optional: true },
  depositId: { type: 'TEXT', optional: true },
  depositInstruction: { type: 'TEXT', optional: true },
  depositNetwork: { type: 'TEXT', optional: true },
  payoutId: { type: 'TEXT', optional: true },
  status: { type: 'TEXT' },
  statusLogJson: { type: 'TEXT' },
  expiresAt: { type: 'TEXT', optional: true },
  createdAt: { type: 'REAL' },
  updatedAt: { type: 'REAL' },
})

/** A user's path towards an account at a partner SGI. */
export const Journey = createTable('journey', {
  journeyId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  sgiId: { type: 'TEXT', optional: true },
  status: { type: 'TEXT' },
  checklistJson: { type: 'TEXT' },
  consentAt: { type: 'REAL', optional: true },
  submittedAt: { type: 'REAL', optional: true },
  updatedAt: { type: 'REAL' },
})

/** Status changes communicated by (or simulated for) the partner SGI. */
export const JourneyStatusLog = createTable('journeyStatusLog', {
  logId: { type: 'INTEGER', primary: true },
  journeyId: { type: 'INTEGER' },
  status: { type: 'TEXT' },
  note: { type: 'TEXT', optional: true },
  createdAt: { type: 'REAL' },
})

/** Product analytics feeding the partner funnel. No personal data. */
export const JourneyEvent = createTable('journeyEvent', {
  eventId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  type: { type: 'TEXT' },
  symbol: { type: 'TEXT', optional: true },
  sgiId: { type: 'TEXT', optional: true },
  createdAt: { type: 'REAL' },
})

export const SocialPost = createTable('socialPost', {
  postId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER' },
  authorName: { type: 'TEXT' },
  authorHandle: { type: 'TEXT' },
  avatarUrl: { type: 'TEXT' },
  isExample: { type: 'INTEGER' }, // 0 or 1
  content: { type: 'TEXT' },
  symbol: { type: 'TEXT', optional: true },
  sentiment: { type: 'TEXT', optional: true },
  tradeAction: { type: 'TEXT', optional: true }, // 'ACHAT' | 'VENTE'
  tradePriceFcfa: { type: 'REAL', optional: true },
  tradeChangePercent: { type: 'REAL', optional: true },
  likesCount: { type: 'INTEGER' },
  commentsCount: { type: 'INTEGER' },
  createdAt: { type: 'REAL' },
})

export const SocialComment = createTable('socialComment', {
  commentId: { type: 'INTEGER', primary: true },
  postId: { type: 'INTEGER' },
  userId: { type: 'INTEGER' },
  authorName: { type: 'TEXT' },
  authorHandle: { type: 'TEXT' },
  avatarUrl: { type: 'TEXT' },
  content: { type: 'TEXT' },
  createdAt: { type: 'REAL' },
})

/* -------------------------------------------------------------------------- */
/* Database Indexes                                                           */
/* -------------------------------------------------------------------------- */

sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON user(email)`.run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_login ON user(login)`.run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_symbol ON stock(symbol)`.run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_history_symbol_day ON quoteHistory(symbol, day)`
  .run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_paper_account_user ON paperAccount(userId)`
  .run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_position_user_symbol ON paperPosition(userId, symbol)`
  .run()
sql`CREATE INDEX IF NOT EXISTS idx_order_user ON paperOrder(userId, createdAt DESC)`
  .run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_funding_reference ON fundingRequest(reference)`
  .run()
sql`CREATE INDEX IF NOT EXISTS idx_funding_user ON fundingRequest(userId, createdAt DESC)`
  .run()
sql`CREATE INDEX IF NOT EXISTS idx_funding_sgi ON fundingRequest(sgiId, createdAt DESC)`
  .run()
sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_journey_user ON journey(userId)`.run()
sql`CREATE INDEX IF NOT EXISTS idx_event_type ON journeyEvent(type, sgiId)`
  .run()
sql`CREATE INDEX IF NOT EXISTS idx_post_created ON socialPost(createdAt DESC)`
  .run()
sql`CREATE INDEX IF NOT EXISTS idx_comments_post ON socialComment(postId, createdAt ASC)`
  .run()

/* -------------------------------------------------------------------------- */
/* Type Exports for Business Logic                                            */
/* -------------------------------------------------------------------------- */

export type UserRow = Row<typeof User.properties>
export type PaperOrderRow = Row<typeof PaperOrder.properties>
export type JourneyRow = Row<typeof Journey.properties>
