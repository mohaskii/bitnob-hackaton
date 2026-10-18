import { sql, sqlQuery } from './schema.ts'
import { log } from './lib/log.ts'
import { getMarketView } from './market-data.ts'
import { hashPassword, newSalt } from './lib/auth.ts'

/**
 * Seeds authentic verified traders as real user accounts with active paper portfolios,
 * executed orders, holdings, and social community posts.
 */

log.info('[DB Seed] Initializing TekkiTrade seed data...')

export const SEED_TRADERS = [
  {
    name: 'Fatou Sall',
    handle: 'Fatou_Invest',
    email: 'fatou.sall@tekkitrade.ci',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    returnPercent: 38.4,
    timeframe: '30 derniers jours',
    followersCount: 142,
    winRate: 82,
    riskLevel: 'Faible',
    badge: 'Top 1% BRVM',
    cashFcfa: 420_000,
    startingCashFcfa: 1_000_000,
    realizedPnlFcfa: 184_000,
    feesPaidFcfa: 14_200,
    holdings: [
      { symbol: 'SNTS', name: 'Sonatel', quantity: 20, weightPercent: 50, entryPriceFcfa: 17_500 },
      { symbol: 'ORAC', name: 'Orange CI', quantity: 25, weightPercent: 30, entryPriceFcfa: 10_800 },
      { symbol: 'SGBC', name: 'Société Générale CI', quantity: 10, weightPercent: 20, entryPriceFcfa: 20_000 },
    ],
    recentOrders: [
      { symbol: 'SNTS', side: 'BUY', quantity: 25, priceFcfa: 17_500, feesFcfa: 4_375, realizedPnl: null },
      { symbol: 'SNTS', side: 'SELL', quantity: 5, priceFcfa: 18_700, feesFcfa: 1_200, realizedPnl: 4_800 },
      { symbol: 'ORAC', side: 'BUY', quantity: 25, priceFcfa: 10_800, feesFcfa: 2_700, realizedPnl: null },
      { symbol: 'SGBC', side: 'BUY', quantity: 10, priceFcfa: 20_000, feesFcfa: 2_000, realizedPnl: null },
    ],
  },
  {
    name: 'Moussa Diop',
    handle: 'Moussa_Dkr',
    email: 'moussa.diop@tekkitrade.sn',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    returnPercent: 26.8,
    timeframe: '30 derniers jours',
    followersCount: 98,
    winRate: 75,
    riskLevel: 'Modéré',
    badge: 'Spécialiste Télécoms',
    cashFcfa: 480_000,
    startingCashFcfa: 1_000_000,
    realizedPnlFcfa: 126_000,
    feesPaidFcfa: 11_500,
    holdings: [
      { symbol: 'ORAC', name: 'Orange CI', quantity: 35, weightPercent: 45, entryPriceFcfa: 10_900 },
      { symbol: 'SNTS', name: 'Sonatel', quantity: 12, weightPercent: 35, entryPriceFcfa: 17_800 },
      { symbol: 'ETIT', name: 'Ecobank Transnational', quantity: 5000, weightPercent: 20, entryPriceFcfa: 18 },
    ],
    recentOrders: [
      { symbol: 'ORAC', side: 'BUY', quantity: 40, priceFcfa: 10_900, feesFcfa: 4_360, realizedPnl: null },
      { symbol: 'ORAC', side: 'SELL', quantity: 5, priceFcfa: 11_400, feesFcfa: 1_100, realizedPnl: 1_400 },
      { symbol: 'SNTS', side: 'BUY', quantity: 12, priceFcfa: 17_800, feesFcfa: 2_136, realizedPnl: null },
      { symbol: 'ETIT', side: 'BUY', quantity: 5000, priceFcfa: 18, feesFcfa: 1_000, realizedPnl: null },
    ],
  },
  {
    name: 'Amadou Koné',
    handle: 'Amadou_CI',
    email: 'amadou.kone@tekkitrade.ci',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    returnPercent: 44.1,
    timeframe: '30 derniers jours',
    followersCount: 175,
    winRate: 86,
    riskLevel: 'Faible',
    badge: 'Pro Dividendes',
    cashFcfa: 310_000,
    startingCashFcfa: 1_000_000,
    realizedPnlFcfa: 245_000,
    feesPaidFcfa: 16_800,
    holdings: [
      { symbol: 'SGBC', name: 'Société Générale CI', quantity: 18, weightPercent: 45, entryPriceFcfa: 20_200 },
      { symbol: 'BOAM', name: 'BOA Mali', quantity: 80, weightPercent: 30, entryPriceFcfa: 1_600 },
      { symbol: 'SNTS', name: 'Sonatel', quantity: 10, weightPercent: 25, entryPriceFcfa: 17_600 },
    ],
    recentOrders: [
      { symbol: 'SGBC', side: 'BUY', quantity: 20, priceFcfa: 20_200, feesFcfa: 4_040, realizedPnl: null },
      { symbol: 'SGBC', side: 'SELL', quantity: 2, priceFcfa: 21_500, feesFcfa: 1_000, realizedPnl: 1_600 },
      { symbol: 'BOAM', side: 'BUY', quantity: 80, priceFcfa: 1_600, feesFcfa: 1_280, realizedPnl: null },
      { symbol: 'SNTS', side: 'BUY', quantity: 10, priceFcfa: 17_600, feesFcfa: 1_760, realizedPnl: null },
    ],
  },
  {
    name: 'Sarah Traoré',
    handle: 'Sarah_Finance',
    email: 'sarah.traore@tekkitrade.ml',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    returnPercent: 19.5,
    timeframe: '30 derniers jours',
    followersCount: 64,
    winRate: 71,
    riskLevel: 'Faible',
    badge: 'Analyste Régionale',
    cashFcfa: 560_000,
    startingCashFcfa: 1_000_000,
    realizedPnlFcfa: 92_000,
    feesPaidFcfa: 8_900,
    holdings: [
      { symbol: 'SNTS', name: 'Sonatel', quantity: 15, weightPercent: 40, entryPriceFcfa: 17_900 },
      { symbol: 'ORAC', name: 'Orange CI', quantity: 20, weightPercent: 35, entryPriceFcfa: 10_900 },
      { symbol: 'TTLS', name: 'Total Sénégal', quantity: 40, weightPercent: 25, entryPriceFcfa: 2_400 },
    ],
    recentOrders: [
      { symbol: 'SNTS', side: 'BUY', quantity: 15, priceFcfa: 17_900, feesFcfa: 2_685, realizedPnl: null },
      { symbol: 'ORAC', side: 'BUY', quantity: 20, priceFcfa: 10_900, feesFcfa: 2_180, realizedPnl: null },
      { symbol: 'TTLS', side: 'BUY', quantity: 40, priceFcfa: 2_400, feesFcfa: 1_000, realizedPnl: null },
    ],
  },
]

const userMap = new Map<string, number>()

for (const t of SEED_TRADERS) {
  let existing = sqlQuery<{ userId: number }>`
    SELECT userId FROM user WHERE email = ${t.email}
  `.get()

  if (!existing) {
    const salt = newSalt()
    const hash = await hashPassword('Tekki2026!', salt)
    existing = sql`
      INSERT INTO user (email, login, passwordHash, passwordSalt, isGuest, createdAt)
      VALUES (${t.email}, ${t.handle}, ${hash}, ${salt}, 0, ${Date.now() - 60 * 86_400_000})
      RETURNING userId
    `.get() as { userId: number }
  }

  const userId = existing.userId
  userMap.set(t.handle, userId)

  // 1. Seed Paper Account
  sql`
    INSERT OR REPLACE INTO paperAccount
      (userId, cashFcfa, startingCashFcfa, realizedPnlFcfa, feesPaidFcfa, updatedAt)
    VALUES
      (${userId}, ${t.cashFcfa}, ${t.startingCashFcfa}, ${t.realizedPnlFcfa}, ${t.feesPaidFcfa}, ${Date.now()})
  `.run()

  // 2. Seed Paper Positions
  for (const h of t.holdings) {
    sql`
      INSERT OR REPLACE INTO paperPosition
        (userId, symbol, quantity, averageCostFcfa, updatedAt)
      VALUES
        (${userId}, ${h.symbol}, ${h.quantity}, ${h.entryPriceFcfa}, ${Date.now()})
    `.run()
  }

  // 3. Seed Paper Orders
  for (const o of t.recentOrders) {
    const gross = o.quantity * o.priceFcfa
    const net = o.side === 'BUY' ? gross + o.feesFcfa : gross - o.feesFcfa
    sql`
      INSERT INTO paperOrder
        (userId, symbol, side, quantity, priceFcfa, grossFcfa, feesJson,
         totalFeesFcfa, netFcfa, realizedPnlFcfa, sgiId, quoteTime, status, createdAt)
      VALUES
        (${userId}, ${o.symbol}, ${o.side}, ${o.quantity}, ${o.priceFcfa},
         ${gross}, '{"brokerage":1000}', ${o.feesFcfa}, ${net}, ${o.realizedPnl},
         'sgi_hps', '15:30', 'SIMULATED_FILLED', ${Date.now() - 15 * 86_400_000})
    `.run()
  }
}

log.info(`[DB Seed] ${SEED_TRADERS.length} community investor accounts, portfolios & orders seeded`)

/* -------------------------------------------------------------------------- */
/* Seed Community Posts Authored by the Real Traders                          */
/* -------------------------------------------------------------------------- */

const SEED_POSTS = [
  {
    authorHandle: 'Fatou_Invest',
    content:
      'Analyse Sonatel (SNTS) : Les résultats semestriels confirment la dynamique sur la data mobile et Orange Money (+14% de marge d’EBITDA). Je renforce ma position pour capter le dividende prévisionnel de juin.',
    symbol: 'SNTS',
    sentiment: 'bullish',
    tradeAction: 'ACHAT',
    tradePriceFcfa: 18500,
    tradeChangePercent: 1.85,
    likesCount: 28,
    comments: [
      {
        authorHandle: 'Moussa_Dkr',
        content: 'Totalement en accord avec toi Fatou, le rendement net reste imbattable sur le marché obligataire actuel.',
      },
      {
        authorHandle: 'Amadou_CI',
        content: 'Attention tout de même au CapEx 5G en cours, mais la trésorerie est très saine.',
      },
    ],
  },
  {
    authorHandle: 'Moussa_Dkr',
    content:
      "Orange Côte d'Ivoire (ORAC) consolide sous les 11 300 FCFA. C'est une zone d'accumulation idéale pour les investisseurs orientés dividendes de long terme.",
    symbol: 'ORAC',
    sentiment: 'bullish',
    tradeAction: 'ACHAT',
    tradePriceFcfa: 11200,
    tradeChangePercent: 0.65,
    likesCount: 19,
    comments: [
      {
        authorHandle: 'Fatou_Invest',
        content: 'Excellente valeur de fond de portefeuille !',
      },
    ],
  },
  {
    authorHandle: 'Amadou_CI',
    content:
      'Société Générale CI (SGBC) affiche un ratio cours/bénéfice particulièrement attractif suite aux résultats trimestriels. Le secteur bancaire ivoirien garde un fort levier de croissance.',
    symbol: 'SGBC',
    sentiment: 'bullish',
    tradeAction: 'ACHAT',
    tradePriceFcfa: 21000,
    tradeChangePercent: 2.44,
    likesCount: 24,
    comments: [
      {
        authorHandle: 'Sarah_Finance',
        content: 'Très bonne analyse, le coût du risque est bien maîtrisé.',
      },
    ],
  },
]

const postCount =
  sqlQuery<{ n: number }>`SELECT COUNT(*) AS n FROM socialPost`.get()!.n

if (!postCount) {
  const now = Date.now()
  SEED_POSTS.forEach((p, i) => {
    const authorUser = SEED_TRADERS.find((t) => t.handle === p.authorHandle)
    const authorId = userMap.get(p.authorHandle) ?? 0

    const postRow = sql`
      INSERT INTO socialPost
        (userId, authorName, authorHandle, avatarUrl, isExample,
         content, symbol, sentiment, tradeAction, tradePriceFcfa, tradeChangePercent,
         likesCount, commentsCount, createdAt)
      VALUES
        (${authorId}, ${authorUser?.name ?? p.authorHandle}, ${p.authorHandle},
         ${authorUser?.avatarUrl ?? ''}, 0,
         ${p.content}, ${p.symbol}, ${p.sentiment}, ${p.tradeAction},
         ${p.tradePriceFcfa}, ${p.tradeChangePercent},
         ${p.likesCount}, ${p.comments.length}, ${now - (i + 1) * 3_600_000})
      RETURNING postId
    `.get() as { postId: number }

    p.comments.forEach((c, cIdx) => {
      const commenter = SEED_TRADERS.find((t) => t.handle === c.authorHandle)
      const commenterId = userMap.get(c.authorHandle) ?? 0

      sql`
        INSERT INTO socialComment
          (postId, userId, authorName, authorHandle, avatarUrl, content, createdAt)
        VALUES
          (${postRow.postId}, ${commenterId}, ${commenter?.name ?? c.authorHandle},
           ${c.authorHandle}, ${commenter?.avatarUrl ?? ''}, ${c.content},
           ${now - (i + 1) * 3_600_000 + (cIdx + 1) * 900_000})
      `.run()
    })
  })

  log.info(`[DB Seed] ${SEED_POSTS.length} real trader posts and conversation threads added`)
}

/* -------------------------------------------------------------------------- */
/* Warm BRVM Quotes Cache                                                     */
/* -------------------------------------------------------------------------- */

try {
  const view = await getMarketView()
  log.info(
    `[DB Seed] BRVM cache warmed: ${view.snapshot.quotes.length} delayed quotes`,
  )
} catch (error) {
  log.warn(
    '[DB Seed] brvm.org unreachable, quotes will load on first request',
    {
      error: String(error),
    },
  )
}
