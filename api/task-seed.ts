import { SocialPost, sql, sqlQuery, Stock, Trader, User, Wallet } from './schema.ts'
import { log } from './lib/log.ts'

log.info('[DB Seed] Initializing TekkiTrade SQLite seed data...')

// 1. Seed Demo User
const existingUser = sqlQuery<{ userId: number }>`SELECT userId FROM user WHERE userId = 1`.all()[0]

if (!existingUser) {
  const now = Date.now()
  sql`
    INSERT INTO user (userId, email, login, phone, password, bitnobCustomerId, createdAt)
    VALUES (1, 'vous@tekkitrade.africa', 'Moi_Trader', '+221770000000', X'00', 'cust_demo_tekkitrade', ${now})
  `.run()

  sql`
    INSERT INTO wallet (walletId, userId, balanceFcfa, balanceUsdt, updatedAt)
    VALUES (1, 1, 209890, 345.20, ${now})
  `.run()

  log.info('[DB Seed] Demo user (ID 1) & wallet initialized (209 890 FCFA)')
}

// 2. Seed BRVM Stocks
const BRVM_SEED_STOCKS = [
  {
    symbol: 'SNTS',
    name: 'Sonatel',
    sector: 'Télécoms',
    priceFcfa: 18500,
    changePercent: 1.85,
    history: [18100, 18150, 18200, 18180, 18300, 18400, 18350, 18500],
    logoColor: 'bg-primary/20 text-primary-content',
    logoText: 'S',
  },
  {
    symbol: 'ORAC',
    name: 'Orange Côte d\'Ivoire',
    sector: 'Télécoms',
    priceFcfa: 11200,
    changePercent: 0.65,
    history: [11100, 11150, 11120, 11180, 11200],
    logoColor: 'bg-accent/20 text-accent-content',
    logoText: 'O',
  },
  {
    symbol: 'SGBC',
    name: 'Société Générale CI',
    sector: 'Finance',
    priceFcfa: 21000,
    changePercent: -1.41,
    history: [21400, 21350, 21200, 21100, 21000],
    logoColor: 'bg-error/20 text-error-content',
    logoText: 'SG',
  },
  {
    symbol: 'ETIT',
    name: 'Ecobank Transnational Inc.',
    sector: 'Finance',
    priceFcfa: 19,
    changePercent: 5.56,
    history: [18, 18, 18.5, 18.5, 19],
    logoColor: 'bg-info/20 text-info-content',
    logoText: 'E',
  },
  {
    symbol: 'TTLS',
    name: 'Total Sénégal',
    sector: 'Énergie',
    priceFcfa: 2450,
    changePercent: 0.00,
    history: [2450, 2450, 2450, 2450, 2450],
    logoColor: 'bg-warning/20 text-warning-content',
    logoText: 'T',
  },
  {
    symbol: 'PALC',
    name: 'Palm Côte d\'Ivoire',
    sector: 'Agriculture',
    priceFcfa: 6800,
    changePercent: -2.16,
    history: [6980, 6950, 6900, 6850, 6800],
    logoColor: 'bg-success/20 text-success-content',
    logoText: 'P',
  },
  {
    symbol: 'CABC',
    name: 'Coris Bank International',
    sector: 'Finance',
    priceFcfa: 10400,
    changePercent: 3.20,
    history: [10000, 10100, 10250, 10300, 10400],
    logoColor: 'bg-secondary/20 text-secondary-content',
    logoText: 'CB',
  },
]

for (const stock of BRVM_SEED_STOCKS) {
  const existing = sqlQuery<{ stockId: number }>`SELECT stockId FROM stock WHERE symbol = ${stock.symbol}`.all()[0]
  if (!existing) {
    sql`
      INSERT INTO stock (symbol, name, sector, priceFcfa, changePercent, historyJson, logoColor, logoText, updatedAt)
      VALUES (${stock.symbol}, ${stock.name}, ${stock.sector}, ${stock.priceFcfa}, ${stock.changePercent}, ${JSON.stringify(stock.history)}, ${stock.logoColor}, ${stock.logoText}, ${Date.now()})
    `.run()
  }
}
log.info(`[DB Seed] BRVM stocks verified (${BRVM_SEED_STOCKS.length} seeded)`)

// 3. Seed Top Traders
const SEED_TRADERS = [
  {
    traderId: 1,
    name: 'Fatou Sall',
    handle: 'Fatou_Invest',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    verified: 1,
    returnPercent: 38.4,
    timeframe: 'Ce mois',
    copiersCount: 142,
    winRate: 84,
    riskLevel: 'Faible',
    badge: 'Top 1% BRVM',
  },
  {
    traderId: 2,
    name: 'Amadou Koné',
    handle: 'Amadou_CI',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    verified: 1,
    returnPercent: 29.1,
    timeframe: 'Ce mois',
    copiersCount: 98,
    winRate: 78,
    riskLevel: 'Modéré',
    badge: 'Spécialiste Finance',
  },
  {
    traderId: 3,
    name: 'Moussa Diop',
    handle: 'Moussa_Dkr',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    verified: 1,
    returnPercent: 22.8,
    timeframe: 'Ce mois',
    copiersCount: 67,
    winRate: 72,
    riskLevel: 'Faible',
    badge: 'Dividendes Focus',
  },
]

for (const t of SEED_TRADERS) {
  const existing = sqlQuery<{ traderId: number }>`SELECT traderId FROM trader WHERE traderId = ${t.traderId}`.all()[0]
  if (!existing) {
    sql`
      INSERT INTO trader (traderId, name, handle, avatarUrl, verified, returnPercent, timeframe, copiersCount, winRate, riskLevel, badge)
      VALUES (${t.traderId}, ${t.name}, ${t.handle}, ${t.avatarUrl}, ${t.verified}, ${t.returnPercent}, ${t.timeframe}, ${t.copiersCount}, ${t.winRate}, ${t.riskLevel}, ${t.badge})
    `.run()
  }
}
log.info('[DB Seed] Top Traders seeded')

// 4. Seed Initial Social Feed Posts
const SEED_POSTS = [
  {
    postId: 1,
    userId: 1,
    authorName: 'Fatou Sall',
    authorHandle: 'Fatou_Invest',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    verified: 1,
    content:
      'Dividende record confirmé pour Sonatel à 1 750 FCFA par part ! Je viens de renforcer ma position avec 25 parts via le solde Lightning Bitnob. Objectif 20 000 FCFA d\'ici la clôture annuelle.',
    symbol: 'SNTS',
    tradeAction: 'ACHAT',
    priceFcfa: 18500,
    changePercent: 1.85,
    sentiment: 'bullish',
    likesCount: 34,
    commentsCount: 8,
    copiersCount: 19,
    createdAt: Date.now() - 14 * 60000,
  },
  {
    postId: 2,
    userId: 2,
    authorName: 'Amadou Koné',
    authorHandle: 'Amadou_CI',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    verified: 1,
    content:
      'Prise de bénéfices partielle sur SGBC (+14% sur 2 semaines). Je bascule 50% des gains en USDT stables sur ma carte virtuelle Bitnob pour sécuriser la performance.',
    symbol: 'SGBC',
    tradeAction: 'VENTE',
    priceFcfa: 21000,
    changePercent: 2.44,
    sentiment: 'bullish',
    likesCount: 22,
    commentsCount: 5,
    copiersCount: 12,
    createdAt: Date.now() - 45 * 60000,
  },
]

for (const p of SEED_POSTS) {
  const existing = sqlQuery<{ postId: number }>`SELECT postId FROM socialPost WHERE postId = ${p.postId}`.all()[0]
  if (!existing) {
    sql`
      INSERT INTO socialPost (postId, userId, authorName, authorHandle, avatarUrl, verified, content, symbol, tradeAction, priceFcfa, changePercent, sentiment, likesCount, commentsCount, copiersCount, createdAt)
      VALUES (${p.postId}, ${p.userId}, ${p.authorName}, ${p.authorHandle}, ${p.avatarUrl}, ${p.verified}, ${p.content}, ${p.symbol}, ${p.tradeAction}, ${p.priceFcfa}, ${p.changePercent}, ${p.sentiment}, ${p.likesCount}, ${p.commentsCount}, ${p.copiersCount}, ${p.createdAt})
    `.run()
  }
}
log.info('[DB Seed] Social posts seeded')
log.info('[DB Seed] Seeding completed successfully!')
