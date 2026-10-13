import { sql, sqlQuery } from './schema.ts'
import { log } from './lib/log.ts'
import { getMarketView } from './market-data.ts'

/**
 * Seeds illustrative community content and warms the BRVM quote cache.
 * No price is invented: quotes only come from brvm.org.
 */

log.info('[DB Seed] Initializing TekkiTrade seed data...')

const EXAMPLE_TRADERS = [
  {
    name: 'Aïcha (exemple)',
    handle: 'profil_dividendes',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    returnPercent: 9.4,
    timeframe: '12 mois (simulé)',
    followersCount: 0,
    winRate: 64,
    riskLevel: 'Faible',
    badge: 'Stratégie dividendes',
  },
  {
    name: 'Koffi (exemple)',
    handle: 'profil_banques',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    returnPercent: 14.1,
    timeframe: '12 mois (simulé)',
    followersCount: 0,
    winRate: 58,
    riskLevel: 'Modéré',
    badge: 'Secteur bancaire',
  },
  {
    name: 'Mariam (exemple)',
    handle: 'profil_telecoms',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    returnPercent: 6.2,
    timeframe: '12 mois (simulé)',
    followersCount: 0,
    winRate: 61,
    riskLevel: 'Faible',
    badge: 'Télécoms régionaux',
  },
]

const traderCount =
  sqlQuery<{ n: number }>`SELECT COUNT(*) AS n FROM trader`.get()!.n
if (!traderCount) {
  for (const t of EXAMPLE_TRADERS) {
    sql`
      INSERT INTO trader (name, handle, avatarUrl, returnPercent, timeframe,
        followersCount, winRate, riskLevel, badge)
      VALUES (${t.name}, ${t.handle}, ${t.avatarUrl}, ${t.returnPercent}, ${t.timeframe},
        ${t.followersCount}, ${t.winRate}, ${t.riskLevel}, ${t.badge})
    `.run()
  }
  log.info(`[DB Seed] ${EXAMPLE_TRADERS.length} example profiles added`)
}

const EXAMPLE_POSTS = [
  {
    authorName: 'Aïcha (exemple)',
    authorHandle: 'profil_dividendes',
    avatarUrl: EXAMPLE_TRADERS[0].avatarUrl,
    content:
      'Avant mon premier ordre, j’ai comparé le courtage de deux SGI : sur 50 000 FCFA, l’écart de frais représentait plus de 300 FCFA. Ça vaut le coup de regarder la grille tarifaire.',
    symbol: null,
    sentiment: null,
  },
  {
    authorName: 'Koffi (exemple)',
    authorHandle: 'profil_banques',
    avatarUrl: EXAMPLE_TRADERS[1].avatarUrl,
    content:
      'Rappel utile : à la BRVM, on achète des titres entiers. Avec un budget fixe, le simulateur montre combien de titres on peut vraiment acheter, frais compris.',
    symbol: 'SGBC',
    sentiment: 'bullish',
  },
  {
    authorName: 'Mariam (exemple)',
    authorHandle: 'profil_telecoms',
    avatarUrl: EXAMPLE_TRADERS[2].avatarUrl,
    content:
      'Je m’entraîne depuis un mois sur le portefeuille fictif avant d’ouvrir mon compte-titres. Les cours sont différés, mais c’est parfait pour comprendre l’avis d’opéré.',
    symbol: 'SNTS',
    sentiment: 'bullish',
  },
]

const postCount =
  sqlQuery<{ n: number }>`SELECT COUNT(*) AS n FROM socialPost`.get()!.n
if (!postCount) {
  const now = Date.now()
  EXAMPLE_POSTS.forEach((p, i) => {
    sql`
      INSERT INTO socialPost (userId, authorName, authorHandle, avatarUrl, isExample,
        content, symbol, sentiment, likesCount, commentsCount, createdAt)
      VALUES (0, ${p.authorName}, ${p.authorHandle}, ${p.avatarUrl}, 1, ${p.content},
        ${p.symbol}, ${p.sentiment}, ${12 - i * 3}, ${3 - i}, ${
      now - i * 3_600_000
    })
    `.run()
  })
  log.info(`[DB Seed] ${EXAMPLE_POSTS.length} example posts added`)
}

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
