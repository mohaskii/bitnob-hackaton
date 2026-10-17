/** Pure formatting helpers (fr-FR). */

const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

export const fcfa = (value: number) =>
  `${integer.format(Math.round(value))} FCFA`
export const num = (value: number) => integer.format(value)
export const dec = (value: number) => decimal.format(value)

export const signedFcfa = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${
    integer.format(Math.abs(Math.round(value)))
  } FCFA`

export const pct = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${
    decimal.format(Math.abs(value))
  } %`

export const dateTime = (value: string | number | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
    : '—'

export const shortDate = (value: string | number | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
      .format(new Date(value))
    : '—'

export const relativeTime = (value: number) => {
  const minutes = Math.round((Date.now() - value) / 60_000)
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return shortDate(value)
}

/** Deterministic monogram colour per sector, for company badges. */
export const SECTOR_STYLES: Record<string, string> = {
  'Télécoms': 'bg-primary/25 text-base-content',
  'Finance': 'bg-sky-500/15 text-sky-700',
  'Énergie': 'bg-orange-500/15 text-orange-700',
  'Consommation': 'bg-emerald-500/15 text-emerald-700',
  'Industrie': 'bg-violet-500/15 text-violet-700',
  'Services publics': 'bg-cyan-500/15 text-cyan-700',
  'Autres': 'bg-base-200 text-base-content',
}
