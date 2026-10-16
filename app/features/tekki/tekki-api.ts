/** Typed calls to Tekki's backend. Pure module: no signals. */

export type TekkiPage =
  | 'stock'
  | 'trader'
  | 'trade'
  | 'portfolio'
  | 'market'
  | 'replicate'
  | 'general'

export type TekkiContext = {
  page: TekkiPage
  stockSymbol?: string
  traderId?: string
  tradeId?: number
  amountFcfa?: number
  /** Human label shown in the context chip (never sent as data). */
  label?: string
}

export type TekkiAnswer = {
  answer: string
  points: { type: 'FACT' | 'INTERPRETATION'; text: string }[]
  facts: { label: string; value: string }[]
  sources: { id: string; title: string; source: string; url?: string }[]
  language: string
  mode: 'ai' | 'deterministic' | 'knowledge-only'
  provider: string
  guardrailTriggered: boolean
  disclaimer?: string
  suggestions: string[]
}

export type Transcript = {
  text: string
  language: 'wo' | 'fr' | 'mixed' | 'unknown'
  confidence?: number
  frenchGloss?: string
}

export type TraderAnalytics = {
  performancePercent: number
  closedTrades: number
  positiveTrades: number
  winRatePercent: number | null
  averageHoldingDays: number | null
  maxDrawdownPercent: number
  tradesPerMonth: number
  sectorExposure: Record<string, number>
  concentrationLevel: string
}

export type RealStock = {
  symbol: string
  name: string
  sector: string
  activity: string
  priceFcfa: number
  changePercent: number
  volume: number | null
}

export type PostTrade = {
  trade: {
    tradeId: number
    symbol: string
    side: 'BUY' | 'SELL'
    quantity: number
    priceFcfa: number
    executedAt: string
  }
  context: {
    sector: string
    amountFcfa: number
    sectorExposureBefore: number
    sectorExposureAfter: number
    symbolWeightAfter: number
    currentPriceFcfa: number | null
  } | null
}

const call = async <T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> => {
  const res = await fetch(`/api/tekki${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {
    throw new Error('Tekki est injoignable. Vérifie ta connexion.')
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message ?? `Erreur ${res.status}`)
  return data as T
}

export const tekkiApi = {
  status: () =>
    call<
      {
        reasoning: { available: boolean; provider: string }
        speechToText: { available: boolean }
        textToSpeech: { available: boolean; wolof?: string }
      }
    >(
      'GET',
      '/status',
    ),
  market: () =>
    call<
      {
        stocks: RealStock[]
        publishedAt: string
        sessionStatus: string
        stale: boolean
      }
    >(
      'GET',
      '/market',
    ),
  traders: () =>
    call<
      {
        traders: {
          traderId: string
          handle: string
          style: string
          analytics: TraderAnalytics | null
        }[]
      }
    >(
      'GET',
      '/traders',
    ),
  postTrade: (traderId: string, symbol: string) =>
    call<PostTrade>(
      'GET',
      `/post-trade?traderId=${encodeURIComponent(traderId)}&symbol=${
        encodeURIComponent(symbol)
      }`,
    ),
  ask: (input: {
    question: string
    context: TekkiContext
    level: string
    language: string
    retrievalQuery?: string
  }) => {
    const { label: _label, ...context } = input.context
    return call<TekkiAnswer>('POST', '/ask', {
      question: input.question,
      level: input.level,
      language: input.language,
      retrievalQuery: input.retrievalQuery,
      ...context,
    })
  },
  facts: (context: TekkiContext) => {
    const { label: _label, ...ids } = context
    return call<{ facts: { label: string; value: string }[] }>(
      'POST',
      '/facts',
      ids,
    )
  },
  transcribe: (audioBase64: string, mimeType: string) =>
    call<Transcript>('POST', '/transcribe', { audioBase64, mimeType }),
  speak: (text: string, language: string) =>
    call<{ mimeType: string; base64: string }>('POST', '/speak', {
      text,
      language,
    }),
}
