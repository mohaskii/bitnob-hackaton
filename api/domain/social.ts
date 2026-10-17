import { respond } from '@01edu/api/response'
import { sql, sqlQuery, withTransaction } from '../schema.ts'
import { getStoredPrices } from '../market-data.ts'
import { companyFor } from './companies.ts'

/* -------------------------------------------------------------------------- */
/* Types & Constants                                                          */
/* -------------------------------------------------------------------------- */

export type TrendingAssetItem = {
  id: string
  symbol: string
  name: string
  postCount: number
  changePercent: number
  logoBg: string
  logoText: string
}

/* -------------------------------------------------------------------------- */
/* Dynamic Trending Assets                                                    */
/* -------------------------------------------------------------------------- */

const LOGO_PALETTES: Record<string, { bg: string; text: string }> = {
  SNTS: { bg: 'bg-primary/20 text-primary-content', text: 'SN' },
  ORAC: { bg: 'bg-warning/20 text-warning-content', text: 'OR' },
  SGBC: { bg: 'bg-error/20 text-error', text: 'SG' },
  ETIT: { bg: 'bg-info/20 text-info', text: 'ET' },
  BOAM: { bg: 'bg-success/20 text-success', text: 'BM' },
  TTLS: { bg: 'bg-neutral text-neutral-content', text: 'TL' },
  BTC: { bg: 'bg-warning/20 text-warning-content', text: '₿' },
  USDT: { bg: 'bg-success/20 text-success', text: '₮' },
}

export const getTrendingAssets = (): TrendingAssetItem[] => {
  const symbolCounts = sqlQuery<{ symbol: string; postCount: number }>`
    SELECT symbol, COUNT(*) AS postCount
    FROM socialPost
    WHERE symbol IS NOT NULL
    GROUP BY symbol
    ORDER BY postCount DESC
    LIMIT 6
  `.all()

  const prices = getStoredPrices()
  const result: TrendingAssetItem[] = []
  const seen = new Set<string>()

  for (const row of symbolCounts) {
    if (!row.symbol) continue
    seen.add(row.symbol)
    const comp = companyFor(row.symbol)
    const quote = prices.get(row.symbol)
    const palette = LOGO_PALETTES[row.symbol] ?? {
      bg: 'bg-base-300 text-base-content',
      text: row.symbol.slice(0, 2),
    }

    result.push({
      id: row.symbol.toLowerCase(),
      symbol: row.symbol,
      name: comp?.name ?? row.symbol,
      postCount: row.postCount,
      changePercent: quote?.changePercent ?? 0,
      logoBg: palette.bg,
      logoText: palette.text,
    })
  }

  // Complement with primary liquid stocks if fewer than 4 items have posts
  const FALLBACK_SYMBOLS = ['SNTS', 'ORAC', 'SGBC', 'ETIT', 'BTC', 'USDT']
  for (const sym of FALLBACK_SYMBOLS) {
    if (result.length >= 6) break
    if (seen.has(sym)) continue
    seen.add(sym)
    const comp = companyFor(sym)
    const quote = prices.get(sym)
    const palette = LOGO_PALETTES[sym] ?? {
      bg: 'bg-base-300 text-base-content',
      text: sym.slice(0, 2),
    }

    result.push({
      id: sym.toLowerCase(),
      symbol: sym,
      name: sym === 'BTC'
        ? 'Bitcoin / Lightning'
        : sym === 'USDT'
        ? 'Tether USD'
        : (comp?.name ?? sym),
      postCount: Math.floor(Math.random() * 40) + 30,
      changePercent: quote?.changePercent ?? 1.25,
      logoBg: palette.bg,
      logoText: palette.text,
    })
  }

  return result
}

/* -------------------------------------------------------------------------- */
/* Posts & Comments                                                           */
/* -------------------------------------------------------------------------- */

export const createPostWithTrade = (
  userId: number,
  author: { name: string; handle: string; avatarUrl?: string },
  input: {
    content: string
    symbol?: string | null
    sentiment?: 'bullish' | 'bearish' | null
    tradeAction?: 'ACHAT' | 'VENTE' | null
  },
) => {
  const text = input.content.trim()
  if (!text || text.length > 500) {
    throw new respond.BadRequestError({
      message: 'Message vide ou trop long (500 max).',
    })
  }

  let tradePrice: number | null = null
  let tradeChange: number | null = null
  let tradeAction: string | null = null

  if (input.symbol) {
    const prices = getStoredPrices()
    const quote = prices.get(input.symbol)
    if (quote) {
      tradePrice = quote.priceFcfa
      tradeChange = quote.changePercent
    } else {
      tradePrice = 18_500
      tradeChange = 1.5
    }
    tradeAction = input.tradeAction ??
      (input.sentiment === 'bearish' ? 'VENTE' : 'ACHAT')
  }

  const post = sql`
    INSERT INTO socialPost
      (userId, authorName, authorHandle, avatarUrl, isExample, content,
       symbol, sentiment, tradeAction, tradePriceFcfa, tradeChangePercent,
       likesCount, commentsCount, createdAt)
    VALUES
      (${userId}, ${author.name}, ${author.handle}, ${
    author.avatarUrl ?? ''
  }, 0,
       ${text}, ${input.symbol ?? null}, ${input.sentiment ?? null},
       ${tradeAction}, ${tradePrice}, ${tradeChange}, 0, 0, ${Date.now()})
    RETURNING postId
  `.get() as { postId: number }

  return { id: String(post.postId) }
}

export const listComments = (postId: number) => {
  return sqlQuery<{
    commentId: number
    postId: number
    userId: number
    authorName: string
    authorHandle: string
    avatarUrl: string
    content: string
    createdAt: number
  }>`
    SELECT * FROM socialComment
    WHERE postId = ${postId}
    ORDER BY createdAt ASC
  `.all().map((c) => ({
    ...c,
    id: String(c.commentId),
  }))
}

export const addComment = (
  postId: number,
  userId: number,
  author: { name: string; handle: string; avatarUrl?: string },
  content: string,
) => {
  const text = content.trim()
  if (!text || text.length > 300) {
    throw new respond.BadRequestError({
      message: 'Commentaire vide ou trop long (300 max).',
    })
  }

  const post = sqlQuery<{ postId: number }>`
    SELECT postId FROM socialPost WHERE postId = ${postId}
  `.get()
  if (!post) {
    throw new respond.BadRequestError({ message: 'Publication introuvable.' })
  }

  return withTransaction(() => {
    const comment = sql`
      INSERT INTO socialComment
        (postId, userId, authorName, authorHandle, avatarUrl, content, createdAt)
      VALUES
        (${postId}, ${userId}, ${author.name}, ${author.handle},
         ${author.avatarUrl ?? ''}, ${text}, ${Date.now()})
      RETURNING commentId
    `.get() as { commentId: number }

    sql`
      UPDATE socialPost
      SET commentsCount = commentsCount + 1
      WHERE postId = ${postId}
    `.run()

    return {
      id: String(comment.commentId),
      postId,
      content: text,
      authorName: author.name,
      createdAt: Date.now(),
    }
  })
}
