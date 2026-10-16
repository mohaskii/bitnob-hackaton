import { sql, sqlQuery, withTransaction } from './schema.ts'

const BRVM_DELAYED_QUOTES_URL = 'https://www.brvm.org/fr/flux-differe'
const BRVM_ACTIONS_URL = 'https://www.brvm.org/en/cours-actions/0'
const BRVM_BOC_URL = 'https://www.brvm.org/fr/bulletins-officiels-de-la-cote'

export type BrvmQuote = {
  symbol: string
  priceFcfa: number
  changePercent: number
  flowPriceFcfa?: number
  flowChangePercent?: number
  name?: string
  volume?: number
  previousPriceFcfa?: number
  openingPriceFcfa?: number
  closingPriceFcfa?: number
}

export type BrvmIndex = {
  symbol: string
  value: number
  changePercent: number
}

export type BrvmMarketActivity = {
  transactionValueFcfa: number
  equityMarketCapFcfa: number
  bondMarketCapFcfa: number
}

export type BrvmSnapshot = {
  quotes: BrvmQuote[]
  topFive: BrvmQuote[]
  flopFive: BrvmQuote[]
  indices: BrvmIndex[]
  marketActivity: BrvmMarketActivity
  fetchedAt: string
  sourcePageTime: string
  flowPageTime: string
  detailsPageTime: string
  sessionStatus: string
}

type BrvmShareDetails = {
  quotes: Map<string, Partial<BrvmQuote>>
  detailsPageTime: string
}

export type BrvmBulletin = {
  title: string
  url: string
  date: string
}

const cleanText = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&minus;/gi, '-')
    .replace(/&#0*39;|&#x0*27;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()

const parseMarketNumber = (value: string) => {
  const normalized = cleanText(value)
    .replace(/FCFA/gi, '')
    .replace(/%/g, '')
    .replace(/[\s\u00a0]/g, '')
    .replace(',', '.')
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const readTableRows = (html: string, tableClass: string) => {
  const tablePattern = new RegExp(
    `<table\\b[^>]*class=["'][^"']*\\b${tableClass}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/table>`,
    'i',
  )
  const table = html.match(tablePattern)?.[1]
  if (!table) return []

  return [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
    [...row[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) =>
      cleanText(cell[1])
    )
  )
}

const readRows = (tableHtml: string) =>
  [...tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
    [...row[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) =>
      cleanText(cell[1])
    )
  )

const normalizeLabel = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const findColumn = (headers: string[], aliases: string[]) =>
  headers.findIndex((header) =>
    aliases.some((alias) => normalizeLabel(header).includes(alias))
  )

const parseActionsSourceTime = (html: string) => {
  const text = cleanText(html)
  const match = text.match(
    /last update:\s*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s*(\d{1,2})\s+([a-z]+),?\s*(\d{4})\s*[-,]\s*(\d{1,2}):(\d{2})/i,
  )
  if (!match) return ''

  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ]
  const month = months.indexOf(match[2].toLowerCase())
  if (month < 0) return ''
  return new Date(Date.UTC(
    Number(match[3]),
    month,
    Number(match[1]),
    Number(match[4]),
    Number(match[5]),
  )).toISOString()
}

/** Adds the richer fields published in BRVM's official shares table. */
const fetchBrvmShareDetails = async (): Promise<BrvmShareDetails> => {
  const response = await fetch(BRVM_ACTIONS_URL, {
    headers: { 'User-Agent': 'TekkiTrade/1.0 (delayed-quotes reader)' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) {
    throw new Error(`La table des actions BRVM répond ${response.status}.`)
  }

  const html = await response.text()
  const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)]
  for (const table of tables) {
    const rows = readRows(table[1])
    const headerIndex = rows.findIndex((row) =>
      findColumn(row, ['symbol', 'symbole']) >= 0 &&
      findColumn(row, ['name', 'titre']) >= 0 &&
      findColumn(row, ['volume']) >= 0
    )
    if (headerIndex < 0) continue

    const headers = rows[headerIndex]
    const columns = {
      symbol: findColumn(headers, ['symbol', 'symbole']),
      name: findColumn(headers, ['name', 'titre']),
      volume: findColumn(headers, ['volume']),
      previous: findColumn(headers, ['previous price', 'cours precedent']),
      opening: findColumn(headers, ['opening price', 'cours ouverture']),
      closing: findColumn(headers, ['closing price', 'cours cloture']),
      change: findColumn(headers, [
        'change (%)',
        'change percent',
        'variation',
      ]),
    }
    const details = new Map<string, Partial<BrvmQuote>>()

    for (const row of rows.slice(headerIndex + 1)) {
      const symbol = row[columns.symbol]?.toUpperCase()
      const volume = parseMarketNumber(row[columns.volume] ?? '')
      if (!symbol || !/^[A-Z0-9]{3,6}$/.test(symbol) || volume === null) {
        continue
      }
      const previousPriceFcfa = parseMarketNumber(row[columns.previous] ?? '')
      const openingPriceFcfa = parseMarketNumber(row[columns.opening] ?? '')
      const closingPriceFcfa = parseMarketNumber(row[columns.closing] ?? '')
      const changePercent = parseMarketNumber(row[columns.change] ?? '')
      const expectedPreviousPrice = closingPriceFcfa !== null &&
          changePercent !== null && 1 + changePercent / 100 > 0
        ? closingPriceFcfa / (1 + changePercent / 100)
        : null
      const previousPriceIsConsistent = previousPriceFcfa !== null &&
        expectedPreviousPrice !== null &&
        Math.abs(previousPriceFcfa - expectedPreviousPrice) <=
          Math.max(5, expectedPreviousPrice * 0.001)
      details.set(symbol, {
        name: row[columns.name] || symbol,
        volume,
        ...(previousPriceIsConsistent ? { previousPriceFcfa } : {}),
        ...(openingPriceFcfa !== null ? { openingPriceFcfa } : {}),
        ...(closingPriceFcfa !== null ? { closingPriceFcfa } : {}),
        ...(changePercent !== null ? { changePercent } : {}),
      })
    }

    if (details.size > 10) {
      return { quotes: details, detailsPageTime: parseActionsSourceTime(html) }
    }
  }
  throw new Error('La table des actions BRVM n’a pas pu être lue.')
}

const quoteRows = (rows: string[][]) =>
  rows.flatMap((cells) => {
    if (cells.length < 3) return []
    const symbol = cells[0].toUpperCase()
    const priceFcfa = parseMarketNumber(cells[1])
    const changePercent = parseMarketNumber(cells[2])
    if (
      !/^[A-Z0-9]{3,6}$/.test(symbol) || priceFcfa === null ||
      priceFcfa <= 0 || changePercent === null
    ) return []
    return [{ symbol, priceFcfa, changePercent }]
  })

const decodeAttribute = (value: string) =>
  value.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")

/** Finds the newest daily closing bulletin published on BRVM's official site. */
export const fetchLatestBrvmBulletin = async (): Promise<
  BrvmBulletin | null
> => {
  try {
    const response = await fetch(BRVM_BOC_URL, {
      headers: { 'User-Agent': 'TekkiTrade/1.0 (delayed-quotes reader)' },
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) return null

    const html = await response.text()
    const bulletins = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
      .flatMap((match) => {
        const href = match[1].match(/\bhref=["']([^"']+)["']/i)?.[1]
        if (!href || !/\.pdf(?:$|\?)/i.test(href)) return []

        const decodedHref = decodeAttribute(href)
        const dateParts = decodedHref.match(/boc[_-](\d{4})(\d{2})(\d{2})/i)
        if (!dateParts) return []
        const isoDate = `${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`
        const date = new Intl.DateTimeFormat('fr-FR', {
          dateStyle: 'long',
          timeZone: 'UTC',
        }).format(new Date(`${isoDate}T00:00:00Z`))
        const url = new URL(decodeAttribute(href), BRVM_BOC_URL).toString()
        return [{
          title: `Bulletin Officiel de la Cote du ${date}`,
          date,
          url,
          isoDate,
        }]
      })

    bulletins.sort((a, b) => b.isoDate.localeCompare(a.isoDate))
    const latest = bulletins[0]
    return latest
      ? { title: latest.title, date: latest.date, url: latest.url }
      : null
  } catch {
    // The live quote page remains usable even when the bulletin index is down.
    return null
  }
}

const parseSourcePageTime = (html: string) => {
  const text = cleanText(html)
  const match = text.match(
    /(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s*,?\s*(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*,?\s*(\d{4})\s*[-,]\s*(\d{1,2}):(\d{2})/iu,
  )
  if (!match) return ''

  const months = [
    'janvier',
    'fevrier',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'aout',
    'septembre',
    'octobre',
    'novembre',
    'decembre',
  ]
  const month = normalizeLabel(match[2])
  const monthNumber = months.indexOf(month)
  if (monthNumber < 0) return ''
  return new Date(Date.UTC(
    Number(match[3]),
    monthNumber,
    Number(match[1]),
    Number(match[4]),
    Number(match[5]),
  )).toISOString()
}

/**
 * Reads the delayed quote strip displayed on BRVM's public market page.
 * This is deliberately isolated because the page markup is not a documented API.
 */
export const fetchBrvmSnapshot = async (): Promise<BrvmSnapshot> => {
  const shareDetailsPromise = fetchBrvmShareDetails().catch(() => ({
    quotes: new Map<string, Partial<BrvmQuote>>(),
    detailsPageTime: '',
  }))
  const response = await fetch(BRVM_DELAYED_QUOTES_URL, {
    headers: { 'User-Agent': 'TekkiTrade/1.0 (delayed-quotes reader)' },
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(`La page BRVM répond avec le statut ${response.status}.`)
  }

  const html = await response.text()
  const quoteItems = html.matchAll(
    /<div\b[^>]*class=["'][^"']*\bitem\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
  )
  const quotes = new Map<string, BrvmQuote>()

  for (const item of quoteItems) {
    const spans = [...item[1].matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/gi)]
    if (spans.length < 3) continue

    const symbol = cleanText(spans[0][1]).toUpperCase()
    const priceFcfa = parseMarketNumber(spans[1][1])
    const changePercent = parseMarketNumber(spans[2][1])

    if (
      !/^[A-Z0-9]{3,6}$/.test(symbol) ||
      priceFcfa === null || priceFcfa <= 0 ||
      changePercent === null
    ) continue

    quotes.set(symbol, {
      symbol,
      priceFcfa,
      changePercent,
      flowPriceFcfa: priceFcfa,
      flowChangePercent: changePercent,
    })
  }

  if (quotes.size < 10) {
    throw new Error(
      'Les cotations BRVM n’ont pas pu être lues. La page a peut-être changé de format.',
    )
  }

  // Use the official shares table for session prices and details when present.
  const shareDetails = await shareDetailsPromise
  for (const [symbol, detail] of shareDetails.quotes) {
    const quote = quotes.get(symbol)
    if (!quote) continue
    quotes.set(symbol, {
      ...quote,
      ...detail,
      ...(detail.closingPriceFcfa && detail.closingPriceFcfa > 0
        ? { priceFcfa: detail.closingPriceFcfa }
        : {}),
    })
  }

  const topFive = quoteRows(readTableRows(html, 'top-five'))
  const flopFive = quoteRows(readTableRows(html, 'flop-five'))
  const activityRows = readTableRows(html, 'activity')
  const activity = new Map<string, string[]>()
  for (const row of activityRows) {
    if (row.length < 2) continue
    activity.set(normalizeLabel(row[0]), row.slice(1))
  }

  const transactionValueFcfa = parseMarketNumber(
    activity.get('valeur des transactions')?.[0] ?? '',
  )
  const equityMarketCapFcfa = parseMarketNumber(
    activity.get('capitalisation actions')?.[0] ?? '',
  )
  const bondMarketCapFcfa = parseMarketNumber(
    activity.get('capitalisation des obligations')?.[0] ?? '',
  )
  // Market-wide indicators are optional: quotes stay usable without them.

  const indices = ['BRVM-C', 'BRVM-30', 'BRVM-PRES'].flatMap((symbol) => {
    const values = activity.get(symbol.toLowerCase())
    const value = values ? parseMarketNumber(values[0]) : null
    const changePercent = values?.[1] ? parseMarketNumber(values[1]) : null
    return value === null || changePercent === null
      ? []
      : [{ symbol, value, changePercent }]
  })

  const pageText = cleanText(html).toLocaleLowerCase('fr-FR')
  const sessionStatus = pageText.includes('séance ouverte')
    ? 'Séance ouverte'
    : pageText.includes('séance fermée')
    ? 'Séance fermée'
    : 'Statut de séance indisponible'

  return {
    quotes: [...quotes.values()],
    topFive,
    flopFive,
    indices,
    marketActivity: {
      transactionValueFcfa: transactionValueFcfa ?? 0,
      equityMarketCapFcfa: equityMarketCapFcfa ?? 0,
      bondMarketCapFcfa: bondMarketCapFcfa ?? 0,
    },
    fetchedAt: new Date().toISOString(),
    sourcePageTime: shareDetails.detailsPageTime || parseSourcePageTime(html),
    flowPageTime: parseSourcePageTime(html),
    detailsPageTime: shareDetails.detailsPageTime,
    sessionStatus,
  }
}

/* -------------------------------------------------------------------------- */
/* Cache & persistence                                                         */
/* -------------------------------------------------------------------------- */

const SNAPSHOT_TTL_MS = 60_000
const BULLETIN_TTL_MS = 10 * 60_000

let memorySnapshot: { snapshot: BrvmSnapshot; at: number } | null = null
let inflightSnapshot: Promise<BrvmSnapshot> | null = null
let memoryBulletin: { bulletin: BrvmBulletin | null; at: number } | null = null

export type MarketView = {
  snapshot: BrvmSnapshot
  /** True when brvm.org was unreachable and the last saved snapshot is used. */
  stale: boolean
  staleReason: string
}

const tradingDay = (snapshot: BrvmSnapshot) =>
  (snapshot.sourcePageTime || snapshot.fetchedAt).slice(0, 10)

/** Stores quotes, one history point per day and the full snapshot. */
const persistSnapshot = (snapshot: BrvmSnapshot) =>
  withTransaction(() => {
    const day = tradingDay(snapshot)
    for (const quote of snapshot.quotes) {
      sql`
        INSERT INTO quoteHistory (symbol, day, priceFcfa)
        VALUES (${quote.symbol}, ${day}, ${quote.priceFcfa})
        ON CONFLICT(symbol, day) DO UPDATE SET priceFcfa = excluded.priceFcfa
      `.run()
    }
    sql`DELETE FROM marketCache`.run()
    sql`
      INSERT INTO marketCache (payloadJson, fetchedAt)
      VALUES (${JSON.stringify(snapshot)}, ${snapshot.fetchedAt})
    `.run()
  })

const loadPersistedSnapshot = (): BrvmSnapshot | null => {
  const row = sqlQuery<{ payloadJson: string }>`
    SELECT payloadJson FROM marketCache ORDER BY cacheId DESC LIMIT 1
  `.get()
  return row ? JSON.parse(row.payloadJson) as BrvmSnapshot : null
}

/**
 * Delayed BRVM snapshot with a 60 s cache. If brvm.org fails, the last saved
 * snapshot is returned flagged as stale. Prices are never invented.
 */
export const getMarketView = async (): Promise<MarketView> => {
  if (memorySnapshot && Date.now() - memorySnapshot.at < SNAPSHOT_TTL_MS) {
    return { snapshot: memorySnapshot.snapshot, stale: false, staleReason: '' }
  }
  try {
    inflightSnapshot ??= fetchBrvmSnapshot().finally(() => {
      inflightSnapshot = null
    })
    const snapshot = await inflightSnapshot
    persistSnapshot(snapshot)
    memorySnapshot = { snapshot, at: Date.now() }
    return { snapshot, stale: false, staleReason: '' }
  } catch (error) {
    const fallback = memorySnapshot?.snapshot ?? loadPersistedSnapshot()
    if (!fallback) throw error
    return {
      snapshot: fallback,
      stale: true,
      staleReason: error instanceof Error ? error.message : String(error),
    }
  }
}

export const getLatestBulletin = async () => {
  if (memoryBulletin && Date.now() - memoryBulletin.at < BULLETIN_TTL_MS) {
    return memoryBulletin.bulletin
  }
  const bulletin = await fetchLatestBrvmBulletin()
  memoryBulletin = { bulletin, at: Date.now() }
  return bulletin
}

/** Up to `days` daily closes per symbol, oldest first. */
export const getQuoteHistory = (days = 30) => {
  const rows = sqlQuery<{ symbol: string; priceFcfa: number }>`
    SELECT symbol, priceFcfa FROM (
      SELECT symbol, day, priceFcfa,
        ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY day DESC) AS rn
      FROM quoteHistory
    ) WHERE rn <= ${days} ORDER BY symbol, day ASC
  `.all()
  const history = new Map<string, number[]>()
  for (const row of rows) {
    const list = history.get(row.symbol) ?? []
    list.push(row.priceFcfa)
    history.set(row.symbol, list)
  }
  return history
}

/** Latest delayed price for one symbol, with its publication time. */
export const getQuote = async (symbol: string) => {
  const view = await getMarketView()
  const quote = view.snapshot.quotes.find((q) => q.symbol === symbol)
  if (!quote) return null
  return {
    ...quote,
    quoteTime: view.snapshot.sourcePageTime || view.snapshot.fetchedAt,
    stale: view.stale,
  }
}

/** Latest known prices from the last saved snapshot (no network call). */
export const getStoredPrices = () => {
  const snapshot = loadPersistedSnapshot()
  return new Map(
    (snapshot?.quotes ?? []).map((q) => [q.symbol, {
      symbol: q.symbol,
      name: q.name ?? q.symbol,
      priceFcfa: q.priceFcfa,
    }]),
  )
}
