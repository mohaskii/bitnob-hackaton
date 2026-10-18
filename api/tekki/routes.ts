import { route } from '@01edu/api/router'
import { boundedCache } from '../lib/cache.ts'
import { withUserSession } from '../lib/auth.ts'
import { respond } from '@01edu/api/response'
import { LIST, NUM, OBJ, optional, STR } from '@01edu/api/validator'
import { decodeBase64 } from '@std/encoding/base64'
import { getLatestBulletin, getMarketView } from '../market-data.ts'
import { companyFor } from '../domain/companies.ts'
import {
  askTekki,
  contextFacts,
  findPostTrade,
  suggestionsFor,
  type TekkiContext,
} from './assistant.ts'
import { describeTrade, ensureExampleTrades, traderAnalytics } from './data.ts'
import { EXAMPLE_PROFILES } from './examples.ts'
import {
  ProviderError,
  providerStatus,
  speechToText,
  textToSpeech,
} from './providers.ts'

/** Same demo session rule as the rest of the API (user 1 by default). */

const MAX_AUDIO_BYTES = 4 * 1024 * 1024
const PAGES = [
  'stock',
  'trader',
  'trade',
  'portfolio',
  'market',
  'replicate',
  'general',
] as const

const asBadRequest = (error: unknown): never => {
  if (error instanceof ProviderError) {
    throw new respond.BadRequestError({ message: error.message })
  }
  throw error
}

/**
 * Replaying an answer must not spend a TTS request (free quota is per day).
 * Clips are a sentence or two (~1 MB of base64 WAV), so 30 stay bounded.
 */
const speechCache = boundedCache<{ mimeType: string; base64: string }>(30)

export const tekkiRoutes = {
  'GET/api/tekki/status': route({
    fn: () => respond.OK(providerStatus()),
    description: 'Which Tekki AI / Voice providers are configured (no secrets)',
  }),

  'GET/api/tekki/market': route({
    fn: async () => {
      const [view, bulletin] = await Promise.all([
        getMarketView(),
        getLatestBulletin(),
      ])
      return respond.OK({
        stocks: view.snapshot.quotes.map((q) => {
          const company = companyFor(q.symbol, q.name)
          return {
            symbol: q.symbol,
            name: company.name,
            sector: company.sector,
            activity: company.activity,
            priceFcfa: q.priceFcfa,
            changePercent: q.changePercent,
            volume: q.volume ?? null,
          }
        }),
        indices: view.snapshot.indices,
        publishedAt: view.snapshot.sourcePageTime || view.snapshot.fetchedAt,
        sessionStatus: view.snapshot.sessionStatus,
        stale: view.stale,
        sourceUrl: 'https://www.brvm.org/fr/flux-differe',
        latestBulletin: bulletin,
      })
    },
    description: 'Real delayed BRVM quotes with company profiles',
  }),

  'GET/api/tekki/traders': route({
    fn: async () => {
      await ensureExampleTrades()
      return respond.OK({
        traders: EXAMPLE_PROFILES.map((p) => {
          const result = traderAnalytics(p.traderId)
          return {
            traderId: p.traderId,
            name: p.name,
            handle: p.handle,
            style: p.style,
            isExample: true,
            analytics: result?.analytics ?? null,
          }
        }),
      })
    },
    description:
      'Example profiles with analytics computed from their trade logs',
  }),

  'GET/api/tekki/post-trade': route({
    fn: async (_ctx, { traderId, symbol }) => {
      const trade = await findPostTrade(traderId, symbol)
      if (!trade) {
        throw new respond.NotFoundError({ message: 'Opération introuvable.' })
      }
      return respond.OK({
        trade,
        context: describeTrade(traderId, trade.tradeId),
      })
    },
    input: OBJ({ traderId: STR(), symbol: STR() }),
    description:
      'The recorded trade behind a feed post, with its portfolio context',
  }),

  'POST/api/tekki/ask': route({
    authorize: withUserSession,
    fn: async (ctx, input) => {
      if (!input.question.trim()) {
        throw new respond.BadRequestError({
          message: 'Pose une question à Tekki.',
        })
      }
      const context: TekkiContext = {
        page: input.page,
        stockSymbol: input.stockSymbol ?? undefined,
        traderId: input.traderId ?? undefined,
        tradeId: input.tradeId ?? undefined,
        amountFcfa: input.amountFcfa ?? undefined,
        portfolioMode: input.portfolioMode ?? undefined,
      }
      return respond.OK(
        await askTekki({
          userId: ctx.session.userId,
          question: input.question,
          retrievalQuery: input.retrievalQuery ?? undefined,
          language: (input.language ?? 'fr') as 'fr' | 'wo' | 'mixed',
          level: (input.level ?? 'beginner') as
            | 'beginner'
            | 'investor'
            | 'advanced',
          context,
        }),
      )
    },
    input: OBJ({
      question: STR('User question, as typed or transcribed'),
      page: LIST(PAGES),
      stockSymbol: optional(STR()),
      traderId: optional(STR()),
      tradeId: optional(NUM()),
      amountFcfa: optional(NUM()),
      portfolioMode: optional(LIST(['live', 'paper'] as const)),
      language: optional(LIST(['fr', 'wo', 'mixed'] as const)),
      level: optional(LIST(['beginner', 'investor', 'advanced'] as const)),
      retrievalQuery: optional(STR('French gloss of a Wolof question')),
    }),
    description:
      'Ask Tekki AI: facts are rebuilt server-side from the context IDs',
  }),

  'POST/api/tekki/facts': route({
    authorize: withUserSession,
    fn: async (ctx, input) =>
      respond.OK({
        facts: await contextFacts({
          page: input.page,
          stockSymbol: input.stockSymbol ?? undefined,
          traderId: input.traderId ?? undefined,
          tradeId: input.tradeId ?? undefined,
          amountFcfa: input.amountFcfa ?? undefined,
          portfolioMode: input.portfolioMode ?? undefined,
        }, ctx.session.userId),
      }),
    input: OBJ({
      page: LIST(PAGES),
      stockSymbol: optional(STR()),
      traderId: optional(STR()),
      tradeId: optional(NUM()),
      amountFcfa: optional(NUM()),
      portfolioMode: optional(LIST(['live', 'paper'] as const)),
    }),
    description:
      'Tekki Analytics facts for a context, without calling the model',
  }),

  'GET/api/tekki/suggestions': route({
    fn: (_ctx, { page }) =>
      respond.OK({ suggestions: suggestionsFor({ page }) }),
    input: OBJ({ page: LIST(PAGES) }),
    description: 'Suggested questions for a screen',
  }),

  'POST/api/tekki/transcribe': route({
    authorize: withUserSession,
    fn: async (_ctx, { audioBase64, mimeType }) => {
      if (!speechToText.available) {
        throw new respond.BadRequestError({
          message: 'Voix indisponible : utilise le mode texte.',
        })
      }
      const audio = decodeBase64(audioBase64)
      if (audio.length > MAX_AUDIO_BYTES) {
        throw new respond.BadRequestError({
          message: 'Enregistrement trop long (30 s maximum).',
        })
      }
      // The audio is only held in memory for the transcription, never stored.
      const transcript = await speechToText.transcribe(audio, mimeType).catch(
        asBadRequest,
      )
      if (!transcript.text) {
        throw new respond.BadRequestError({
          message:
            'Je n’ai rien entendu. Réessaie en maintenant le bouton pendant que tu parles.',
        })
      }
      return respond.OK(transcript)
    },
    input: OBJ({ audioBase64: STR(), mimeType: STR() }),
    description: 'Speech-to-text (Wolof / French), audio not retained',
  }),

  'POST/api/tekki/speak': route({
    authorize: withUserSession,
    fn: async (_ctx, { text, language }) => {
      if (!textToSpeech.available) {
        throw new respond.BadRequestError({ message: 'Audio indisponible.' })
      }
      const clip = text.slice(0, 1200)
      const key = `${language}:${clip}`
      const cached = speechCache.get(key)
      if (cached) return respond.OK(cached)
      const audio = await textToSpeech.synthesize(clip, { language }).catch(
        asBadRequest,
      )
      speechCache.set(key, audio)
      return respond.OK(audio)
    },
    input: OBJ({ text: STR(), language: LIST(['fr', 'wo', 'mixed'] as const) }),
    description: 'Text-to-speech for a Tekki answer',
  }),
} as const
