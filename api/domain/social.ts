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
  // 1. Exact count of community posts discussing each symbol
  const postCounts = new Map<string, number>()
  const postRows = sqlQuery<{ symbol: string; n: number }>`
    SELECT symbol, COUNT(*) AS n
    FROM socialPost
    WHERE symbol IS NOT NULL AND TRIM(symbol) != ''
    GROUP BY symbol
  `.all()
  for (const r of postRows) {
    if (r.symbol) postCounts.set(r.symbol, r.n)
  }

  // 2. Exact count of executed paper trading orders per symbol
  const orderCounts = new Map<string, number>()
  const orderRows = sqlQuery<{ symbol: string; n: number }>`
    SELECT symbol, COUNT(*) AS n
    FROM paperOrder
    WHERE symbol IS NOT NULL AND TRIM(symbol) != ''
    GROUP BY symbol
  `.all()
  for (const r of orderRows) {
    if (r.symbol) orderCounts.set(r.symbol, r.n)
  }

  // 3. Stored live/delayed BRVM market quotes
  const prices = getStoredPrices()

  // Collect active symbols: symbols with posts, orders, or benchmark BRVM equities
  const allSymbols = new Set<string>([
    ...postCounts.keys(),
    ...orderCounts.keys(),
  ])

  // Guarantee inclusion of major liquid equities from BRVM
  const BENCHMARK_EQUITIES = ['SNTS', 'ORAC', 'SGBC', 'ETIT', 'BOAM', 'TTLS']
  for (const sym of BENCHMARK_EQUITIES) {
    allSymbols.add(sym)
  }

  const result: TrendingAssetItem[] = []

  for (const sym of allSymbols) {
    const comp = companyFor(sym)
    const quote = prices.get(sym)
    const pCount = postCounts.get(sym) ?? 0

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
      postCount: pCount,
      changePercent: quote?.changePercent !== undefined
        ? Number(quote.changePercent.toFixed(2))
        : 0,
      logoBg: palette.bg,
      logoText: palette.text,
    })
  }

  // Rank by real business activity: post discussions (weight: 3) + platform orders (weight: 1)
  // Tie-breaker: largest absolute percentage price change on the BRVM
  result.sort((a, b) => {
    const scoreA = ((postCounts.get(a.symbol) ?? 0) * 3) + (orderCounts.get(a.symbol) ?? 0)
    const scoreB = ((postCounts.get(b.symbol) ?? 0) * 3) + (orderCounts.get(b.symbol) ?? 0)
    if (scoreB !== scoreA) return scoreB - scoreA
    return Math.abs(b.changePercent) - Math.abs(a.changePercent)
  })

  return result.slice(0, 8)
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

export const togglePostLike = (userId: number, postId: number) => {
  return withTransaction(() => {
    const existing = sqlQuery<{ userId: number }>`
      SELECT userId FROM socialLike WHERE userId = ${userId} AND postId = ${postId}
    `.get()

    if (existing) {
      sql`DELETE FROM socialLike WHERE userId = ${userId} AND postId = ${postId}`.run()
      sql`UPDATE socialPost SET likesCount = MAX(0, likesCount - 1) WHERE postId = ${postId}`.run()
      const post = sqlQuery<{ likesCount: number }>`
        SELECT likesCount FROM socialPost WHERE postId = ${postId}
      `.get()
      return { postId: String(postId), isLiked: false, likesCount: post?.likesCount ?? 0 }
    } else {
      sql`INSERT INTO socialLike (userId, postId, createdAt) VALUES (${userId}, ${postId}, ${Date.now()})`.run()
      sql`UPDATE socialPost SET likesCount = likesCount + 1 WHERE postId = ${postId}`.run()
      const post = sqlQuery<{ likesCount: number }>`
        SELECT likesCount FROM socialPost WHERE postId = ${postId}
      `.get()
      return { postId: String(postId), isLiked: true, likesCount: post?.likesCount ?? 1 }
    }
  })
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
