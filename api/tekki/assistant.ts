import './tables.ts'
import { sql } from '../schema.ts'
import { boundedCache } from '../lib/cache.ts'
import { log } from '../lib/log.ts'
import { computeFees } from '../domain/fees.ts'
import {
  KNOWLEDGE,
  KNOWLEDGE_VERSION,
  type KnowledgeChunk,
  retrieve,
} from './knowledge.ts'
import { replicationImpact, type TraderAnalytics } from './analytics.ts'
import {
  describeTrade,
  ensureExampleTrades,
  latestTrade,
  sectorOf,
  stockFacts,
  traderAnalytics,
  traderProfile,
  userPortfolio,
  userSgi,
} from './data.ts'
import {
  asksForAdvice,
  DISCLAIMER,
  type Level,
  SAFE_REFUSAL,
  systemPrompt,
  violatesGuardrails,
} from './guardrails.ts'
import { reasoningProvider } from './providers.ts'

/**
 * Tekki AI orchestration:
 *   context IDs → facts from Tekki Analytics + documents (RAG) → LLM → guardrails.
 * Data questions get a deterministic answer without calling the model.
 */

export type TekkiContext = {
  page:
    | 'stock'
    | 'trader'
    | 'trade'
    | 'portfolio'
    | 'market'
    | 'replicate'
    | 'general'
  stockSymbol?: string
  traderId?: string
  tradeId?: number
  amountFcfa?: number
}

export type Fact = { label: string; value: string }

export type TekkiAnswer = {
  answer: string
  points: { type: 'FACT' | 'INTERPRETATION'; text: string }[]
  facts: Fact[]
  sources: { id: string; title: string; source: string; url?: string }[]
  language: string
  mode: 'ai' | 'deterministic' | 'knowledge-only'
  provider: string
  guardrailTriggered: boolean
  disclaimer?: string
  suggestions: string[]
}

const fmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
const fcfa = (v: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(v))} FCFA`
const pct = (
  v: number | null,
) => (v === null ? 'non disponible' : `${v > 0 ? '+' : ''}${fmt.format(v)} %`)
/** Ratios (win rate, shares) carry no sign. */
const ratio = (
  v: number | null,
) => (v === null ? 'non disponible' : `${fmt.format(v)} %`)

/* -------------------------------------------------------------------------- */
/* Facts, built from IDs on the server                                        */
/* -------------------------------------------------------------------------- */

const traderFacts = (a: TraderAnalytics): Fact[] => [
  {
    label: 'Performance sur la période (réalisé + latent)',
    value: pct(a.performancePercent),
  },
  { label: 'Période couverte', value: `${a.periodDays} jours` },
  { label: 'Trades clôturés', value: String(a.closedTrades) },
  { label: 'Trades positifs', value: String(a.positiveTrades) },
  { label: 'Taux de trades gagnants', value: ratio(a.winRatePercent) },
  { label: 'Gain moyen', value: pct(a.averageGainPercent) },
  { label: 'Perte moyenne', value: pct(a.averageLossPercent) },
  { label: 'Drawdown maximal', value: pct(a.maxDrawdownPercent) },
  {
    label: 'Durée moyenne de détention',
    value: a.averageHoldingDays === null
      ? 'non disponible'
      : `${a.averageHoldingDays} jours`,
  },
  { label: 'Trades par mois', value: fmt.format(a.tradesPerMonth) },
  {
    label: 'Exposition par secteur (positions ouvertes)',
    value:
      Object.entries(a.sectorExposure).map(([s, v]) =>
        `${s} ${fmt.format(v)} %`
      ).join(', ') ||
      'aucune position ouverte',
  },
  {
    label: 'Première position',
    value: a.topPosition
      ? `${a.topPosition.symbol} (${fmt.format(a.topPosition.weightPercent)} %)`
      : 'aucune',
  },
  { label: 'Concentration du portefeuille', value: a.concentrationLevel },
  {
    label: 'Comparaison au BRVM Composite',
    value: 'non disponible (historique de l’indice non encore collecté)',
  },
]

const buildFacts = async (context: TekkiContext, userId: number) => {
  const facts: Fact[] = []
  let version = KNOWLEDGE_VERSION
  let isExample = false

  if (context.stockSymbol) {
    const stock = await stockFacts(context.stockSymbol)
    if (stock) {
      facts.push(
        { label: 'Titre', value: `${stock.symbol} — ${stock.name}` },
        { label: 'Secteur', value: stock.sector },
        { label: 'Pays', value: stock.country || 'non disponible' },
        { label: 'Activité', value: stock.activity || 'non disponible' },
        {
          label: 'Dernier cours publié (différé)',
          value: fcfa(stock.priceFcfa),
        },
        { label: 'Variation sur la séance', value: pct(stock.changePercent) },
        {
          label: 'Volume de la séance',
          value: stock.volume === null
            ? 'non disponible'
            : `${stock.volume} titres`,
        },
        {
          label: 'Publication BRVM',
          value: `${stock.publishedAt} (${stock.sessionStatus})`,
        },
        {
          label: 'Dividende et PER',
          value: 'non disponibles dans les données TekkiTrade',
        },
      )
      version += `|stock:${stock.symbol}:${stock.priceFcfa}`
    }
  }

  if (context.traderId) {
    await ensureExampleTrades()
    const profile = traderProfile(context.traderId)
    const result = traderAnalytics(context.traderId)
    if (profile && result) {
      isExample = true
      facts.push(
        {
          label: 'Investisseur',
          value: `${profile.name} (@${profile.handle})`,
        },
        {
          label: 'Nature des données',
          value: 'historique d’exemple généré, pas un investisseur réel',
        },
        ...traderFacts(result.analytics),
      )
      version += `|trader:${result.version}`

      const trade = context.tradeId
        ? describeTrade(context.traderId, context.tradeId)
        : null
      if (trade) {
        facts.push(
          {
            label: 'Opération',
            value: `${
              trade.trade.side === 'BUY' ? 'Achat' : 'Vente'
            } de ${trade.trade.quantity} ${trade.trade.symbol} à ${
              fcfa(trade.trade.priceFcfa)
            } le ${trade.trade.executedAt}`,
          },
          { label: 'Montant de l’opération', value: fcfa(trade.amountFcfa) },
          {
            label: `Exposition ${trade.sector} avant l’opération`,
            value: `${fmt.format(trade.sectorExposureBefore)} %`,
          },
          {
            label: `Exposition ${trade.sector} après l’opération`,
            value: `${fmt.format(trade.sectorExposureAfter)} %`,
          },
          {
            label: `Poids de ${trade.trade.symbol} après l’opération`,
            value: `${fmt.format(trade.symbolWeightAfter)} %`,
          },
          {
            label: `Historique dans le secteur ${trade.sector}`,
            value:
              `${trade.sectorTradesCount} opérations, ${trade.sectorPositiveTrades} positions positives sur ${trade.sectorClosedTrades} clôturées`,
          },
        )
        version += `|trade:${trade.trade.tradeId}`
      }

      if (context.page === 'replicate' && trade && context.amountFcfa) {
        const portfolio = userPortfolio(userId)
        const fees = computeFees(context.amountFcfa, userSgi(userId).schedule)
        const impact = replicationImpact({
          holdings: portfolio.holdings,
          cashFcfa: portfolio.cashFcfa,
          symbol: trade.trade.symbol,
          amountFcfa: context.amountFcfa,
          feesFcfa: fees.totalFcfa,
          sectorOf,
        })
        facts.push(
          { label: 'Montant envisagé', value: fcfa(context.amountFcfa) },
          {
            label: `Ton exposition ${impact.sector}`,
            value: `${fmt.format(impact.sectorExposureBefore)} % → ${
              fmt.format(impact.sectorExposureAfter)
            } %`,
          },
          {
            label: 'Frais estimés (barème SGI de démonstration)',
            value: fcfa(impact.feesFcfa),
          },
          {
            label: 'Ton cash',
            value: `${fcfa(impact.cashBeforeFcfa)} → ${
              fcfa(impact.cashAfterFcfa)
            }`,
          },
          {
            label: 'Prix d’entrée',
            value: `${fcfa(trade.trade.priceFcfa)} pour l’investisseur, ${
              trade.currentPriceFcfa
                ? fcfa(trade.currentPriceFcfa)
                : 'cours actuel non disponible'
            } pour toi aujourd’hui`,
          },
        )
      }
    }
  }

  if (context.page === 'portfolio') {
    const portfolio = userPortfolio(userId)
    const total = portfolio.holdings.reduce((s, h) => s + h.valueFcfa, 0)
    facts.push(
      { label: 'Cash disponible', value: fcfa(portfolio.cashFcfa) },
      {
        label: 'Positions',
        value: portfolio.holdings.map((h) =>
          `${h.symbol} ${fcfa(h.valueFcfa)} (${
            total ? fmt.format((h.valueFcfa / total) * 100) : 0
          } %)`
        ).join(', ') || 'aucune',
      },
    )
  }

  return { facts, version, isExample }
}

/* -------------------------------------------------------------------------- */
/* Deterministic answers (no LLM)                                             */
/* -------------------------------------------------------------------------- */

const UNDERSTANDING =
  /\b(c'?est quoi|qu'?est[- ]ce|signifie|veut dire|pourquoi|explique|comprendre|comment|lan la|lan moy|tekki lan|ndax)\b/i

const QUICK: { pattern: RegExp; label: string }[] = [
  {
    pattern: /\b(win ?rate|taux de (trades )?(gagnants|r[ée]ussite))\b/i,
    label: 'Taux de trades gagnants',
  },
  { pattern: /\bdrawdown\b/i, label: 'Drawdown maximal' },
  {
    pattern: /\b(dur[ée]e moyenne|combien de temps .*garde|holding)\b/i,
    label: 'Durée moyenne de détention',
  },
  {
    pattern: /\b(performance|rendement) (de|du|sur)\b/i,
    label: 'Performance sur la période (réalisé + latent)',
  },
  {
    pattern:
      /\b(quel est le )?(dernier )?cours\b|\bprix (actuel|de l'action)\b/i,
    label: 'Dernier cours publié (différé)',
  },
]

const deterministicAnswer = (question: string, facts: Fact[]) => {
  if (UNDERSTANDING.test(question)) return null
  for (const { pattern, label } of QUICK) {
    if (!pattern.test(question)) continue
    const fact = facts.find((f) => f.label === label)
    if (!fact) continue
    const extra = label === 'Taux de trades gagnants'
      ? ` (${
        facts.find((f) => f.label === 'Trades positifs')?.value
      } trades positifs sur ${
        facts.find((f) => f.label === 'Trades clôturés')?.value
      } clôturés)`
      : ''
    return `${label} : ${fact.value}${extra}.`
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* Template explanations (no LLM): used when no model is available            */
/* -------------------------------------------------------------------------- */

const factValue = (facts: Fact[], label: string) =>
  facts.find((f) => f.label === label)?.value

const factStartingWith = (facts: Fact[], prefix: string) =>
  facts.find((f) => f.label.startsWith(prefix))

/** Plain-French explanation assembled only from computed facts. */
const templateExplanation = (
  context: TekkiContext,
  facts: Fact[],
): string | null => {
  if (context.page === 'stock' && factValue(facts, 'Titre')) {
    return `Tu regardes ${
      factValue(facts, 'Titre')
    }, une entreprise du secteur ${factValue(facts, 'Secteur')} (${
      factValue(facts, 'Pays')
    }). ` +
      `${factValue(facts, 'Activité')} ` +
      `Le dernier cours publié est de ${
        factValue(facts, 'Dernier cours publié (différé)')
      } : c’est le prix d’une action lors de la dernière séance, publié en différé par la BRVM. ` +
      `La variation (${
        factValue(facts, 'Variation sur la séance')
      }) compare ce prix à la séance précédente. ` +
      'Pour acheter réellement, il faut passer par une SGI, qui facture des frais en plus du prix.'
  }
  if ((context.page === 'trader') && factValue(facts, 'Investisseur')) {
    return `Voici ce que montrent les données de ${
      factValue(facts, 'Investisseur')
    } (profil d’exemple). ` +
      `Il garde ses positions en moyenne ${
        factValue(facts, 'Durée moyenne de détention')
      } et réalise ${
        factValue(facts, 'Trades par mois')
      } opérations par mois. ` +
      `Sur ${factValue(facts, 'Trades clôturés')} trades clôturés, ${
        factValue(facts, 'Trades positifs')
      } sont positifs (${
        factValue(facts, 'Taux de trades gagnants')
      }), avec un gain moyen de ${
        factValue(facts, 'Gain moyen')
      } et une perte moyenne de ${factValue(facts, 'Perte moyenne')}. ` +
      `Son portefeuille actuel : ${
        factValue(facts, 'Exposition par secteur (positions ouvertes)')
      }, concentration ${factValue(facts, 'Concentration du portefeuille')}. ` +
      'Une forte exposition à un secteur augmente le risque si ce secteur traverse une mauvaise période.'
  }
  if (
    (context.page === 'trade' || context.page === 'replicate') &&
    factValue(facts, 'Opération')
  ) {
    const before = facts.find((f) =>
      f.label.startsWith('Exposition') && f.label.includes('avant l’opération')
    )
    const after = facts.find((f) =>
      f.label.startsWith('Exposition') && f.label.includes('après l’opération')
    )
    const sector = before?.label.replace(
      /^Exposition (.+) avant l’opération$/,
      '$1',
    )
    const weight = facts.find((f) => f.label.startsWith('Poids de'))
    const impact = factStartingWith(facts, 'Ton exposition')
    return `Opération observée : ${factValue(facts, 'Opération')}. ` +
      (before && after
        ? `Elle fait passer son exposition au secteur ${sector} de ${before.value} à ${after.value}. `
        : '') +
      (weight ? `${weight.label} : ${weight.value}. ` : '') +
      'Les données ne disent pas pourquoi il l’a faite, seulement ce qu’elle change dans son portefeuille. ' +
      (impact
        ? `Pour toi : ${impact.label.toLowerCase()} ${impact.value}, frais estimés ${
          factValue(facts, 'Frais estimés (barème de la SGI de simulation)')
        }, cash ${factValue(facts, 'Ton cash')}. `
        : '') +
      'La décision t’appartient, après confirmation.'
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* Suggestions                                                                */
/* -------------------------------------------------------------------------- */

export const suggestionsFor = (context: TekkiContext): string[] => {
  switch (context.page) {
    case 'stock':
      return [
        'Explique-moi ce que je regarde comme si je n’avais jamais investi.',
        'Pourquoi ce prix peut-il changer ?',
        'C’est quoi le rendement du dividende ?',
        'Quels risques dois-je comprendre ?',
      ]
    case 'trader':
      return [
        'D’où vient principalement sa performance ?',
        'Quels sont les principaux risques de sa stratégie ?',
        'Son portefeuille est-il concentré ?',
        'Combien de temps garde-t-il ses positions ?',
      ]
    case 'trade':
      return [
        'Que montre cette opération ?',
        'Comment cette opération change son portefeuille ?',
        'Que dois-je comprendre avant de la répliquer ?',
      ]
    case 'replicate':
      return [
        'Quel est l’impact sur mon portefeuille ?',
        'Pourquoi mon prix d’entrée est différent ?',
        'Quels risques avant de confirmer ?',
      ]
    default:
      return [
        'C’est quoi une SGI ?',
        'Quelle différence entre un ordre limite et un ordre au marché ?',
        'Pourquoi diversifier son portefeuille ?',
        'Comment déposer de l’argent avec Bitnob ?',
      ]
  }
}

/* -------------------------------------------------------------------------- */
/* Ask                                                                        */
/* -------------------------------------------------------------------------- */

const toSources = (chunks: KnowledgeChunk[]) =>
  chunks.map((c) => ({
    id: c.id,
    title: c.title,
    source: c.source,
    url: c.sourceUrl,
  }))

const recordInteraction = (input: {
  userId: number
  task: string
  mode: string
  language: string
  version: string
  sources: string[]
  guardrail: boolean
}) => {
  try {
    sql`
      INSERT INTO aiInteraction (userId, task, provider, model, language, contextVersion,
        sourcesJson, guardrailTriggered, createdAt)
      VALUES (${input.userId}, ${input.task},
        ${input.mode === 'ai' ? reasoningProvider.name : input.mode},
        ${input.mode === 'ai' ? reasoningProvider.model : '-'},
        ${input.language}, ${input.version}, ${JSON.stringify(input.sources)},
        ${input.guardrail ? 1 : 0}, ${new Date().toISOString()})
    `.run()
  } catch (error) {
    log.warn('[Tekki] interaction log failed', { error: String(error) })
  }
}

/** Model answers keyed by prompt (facts included): Gemini quota is small. */
const answerCache = boundedCache<TekkiAnswer>(100)

export const askTekki = async (input: {
  userId: number
  question: string
  /** French rendering used for retrieval when the question is in Wolof. */
  retrievalQuery?: string
  language?: 'fr' | 'wo' | 'mixed'
  level?: Level
  context: TekkiContext
}): Promise<TekkiAnswer> => {
  const language = input.language ?? 'fr'
  const replyLanguage = language === 'mixed' ? 'wo' : language
  const level = input.level ?? 'beginner'
  const question = input.question.trim().slice(0, 600)
  const { facts, version, isExample } = await buildFacts(
    input.context,
    input.userId,
  )
  const chunks = retrieve(`${input.retrievalQuery ?? ''} ${question}`, 3)
  const suggestions = suggestionsFor(input.context)
  const base = {
    facts,
    language: replyLanguage,
    suggestions,
    disclaimer: input.context.traderId ? DISCLAIMER[replyLanguage] : undefined,
  }

  // 1. Data question → deterministic answer, no model call.
  const quick = language === 'fr' ? deterministicAnswer(question, facts) : null
  if (quick) {
    recordInteraction({
      userId: input.userId,
      task: input.context.page,
      mode: 'deterministic',
      language,
      version,
      sources: [],
      guardrail: false,
    })
    return {
      ...base,
      answer: quick,
      points: [{ type: 'FACT', text: quick }],
      sources: [],
      mode: 'deterministic',
      provider: 'tekki-analytics',
      guardrailTriggered: false,
    }
  }

  // 2. No model available → template from facts, or documents only.
  if (!reasoningProvider.available) {
    const fallbackChunks = chunks.length
      ? chunks
      : [KNOWLEDGE.find((c) => c.id === 'tekki-role')!]
    const template = chunks.length &&
        !/explique|analyse|ressort|montre|comprendre|regarde/i.test(question)
      ? null
      : templateExplanation(input.context, facts)
    recordInteraction({
      userId: input.userId,
      task: input.context.page,
      mode: 'knowledge-only',
      language,
      version,
      sources: fallbackChunks.map((c) => c.id),
      guardrail: false,
    })
    return {
      ...base,
      answer: template ?? fallbackChunks[0].text,
      points: template ? [] : fallbackChunks.slice(1).map((c) => ({
        type: 'FACT' as const,
        text: c.text,
      })),
      sources: template ? [] : toSources(fallbackChunks),
      language: 'fr', // documents and templates are written in French
      mode: 'knowledge-only',
      provider: template ? 'tekki-analytics' : 'tekki-knowledge',
      guardrailTriggered: false,
    }
  }

  // 3. LLM explanation constrained to FAITS + DOCUMENTS.
  const user = [
    `PAGE : ${input.context.page}`,
    isExample
      ? 'ATTENTION : le profil analysé est un exemple généré, dis-le si tu en parles.'
      : '',
    asksForAdvice(question)
      ? 'La question demande une décision : ne la prends pas, explique les éléments utiles à la décision.'
      : '',
    'FAITS (seules données chiffrées autorisées) :',
    facts.length
      ? facts.map((f) => `- ${f.label} : ${f.value}`).join('\n')
      : '- aucun',
    'DOCUMENTS :',
    chunks.length
      ? chunks.map((c) => `[${c.id}] ${c.title} (${c.source}) : ${c.text}`)
        .join('\n')
      : '- aucun document pertinent',
    `QUESTION : ${question}`,
  ].filter(Boolean).join('\n')

  // Same question on the same data → same answer, without a model call.
  const cacheKey = JSON.stringify([replyLanguage, level, user])
  const cached = answerCache.get(cacheKey)
  if (cached) return { ...cached, suggestions }

  let parsed: {
    answer?: string
    points?: TekkiAnswer['points']
    sourceIds?: string[]
  } = {}
  try {
    const raw = await reasoningProvider.chat({
      system: systemPrompt(level, replyLanguage),
      user,
      json: true,
    })
    parsed = JSON.parse(raw.replace(/^```(json)?|```$/g, '').trim())
  } catch (error) {
    log.warn('[Tekki] model call failed, using documents', {
      error: String(error),
    })
    const fallbackChunks = chunks.length
      ? chunks
      : [KNOWLEDGE.find((c) => c.id === 'tekki-role')!]
    return {
      ...base,
      answer: fallbackChunks[0].text,
      points: fallbackChunks.map((c) => ({ type: 'FACT', text: c.text })),
      sources: toSources(fallbackChunks),
      language: 'fr', // documents are written in French
      mode: 'knowledge-only',
      provider: 'tekki-knowledge',
      guardrailTriggered: false,
    }
  }

  const answer = String(parsed.answer ?? '').trim()
  const points = (parsed.points ?? [])
    .filter((p) =>
      p && (p.type === 'FACT' || p.type === 'INTERPRETATION') && p.text
    )
    .slice(0, 6)
  const used = new Set(parsed.sourceIds ?? [])
  const sources = toSources(
    chunks.filter((c) => used.has(c.id)).length
      ? chunks.filter((c) => used.has(c.id))
      : chunks,
  )
  const guardrail = violatesGuardrails(
    [answer, ...points.map((p) => p.text)].join(' '),
  )

  recordInteraction({
    userId: input.userId,
    task: input.context.page,
    mode: 'ai',
    language,
    version,
    sources: sources.map((s) => s.id),
    guardrail,
  })

  if (guardrail || !answer) {
    return {
      ...base,
      answer: SAFE_REFUSAL[replyLanguage] ?? SAFE_REFUSAL.fr,
      points: facts.slice(0, 5).map((f) => ({
        type: 'FACT',
        text: `${f.label} : ${f.value}`,
      })),
      sources,
      mode: 'ai',
      provider: reasoningProvider.name,
      guardrailTriggered: guardrail,
    }
  }

  const result: TekkiAnswer = {
    ...base,
    answer,
    points,
    sources,
    mode: 'ai',
    provider: reasoningProvider.name,
    guardrailTriggered: false,
  }
  answerCache.set(cacheKey, result)
  return result
}

/** Facts only (no model call): used by previews such as "Répliquer". */
export const contextFacts = async (context: TekkiContext, userId: number) =>
  (await buildFacts(context, userId)).facts

/** Context card for "Comprendre ce trade": the trade matching a feed post. */
export const findPostTrade = async (traderId: string, symbol: string) => {
  await ensureExampleTrades()
  return latestTrade(traderId, symbol)
}
