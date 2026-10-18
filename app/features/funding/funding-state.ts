import { computed, effect, signal } from '@preact/signals'
import qrcode from 'qrcode-generator'
import { api, errorMessage } from '../../lib/api.ts'
import { showToast } from '../../state.ts'
import { loadHome } from '../home/home-state.ts'
import { loadJourney } from '../journey/journey-state.ts'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type FundingAsset = 'USDT' | 'USDC' | 'BTC'

export type Funding = {
  fundingId: number
  reference: string
  mode: string
  asset: FundingAsset
  amountFcfa: number
  cryptoAmount: string
  rate: number
  bitnobFeesFcfa: number
  depositInstruction: string | null
  depositNetwork: string | null
  status: string
  statusLabel: string
  timeline: { status: string; label: string; at: number; note?: string }[]
  expiresAt: string | null
  createdAt: number
  sgiId: string
  sgiName: string
  payoutId: string | null
}

export type FundingQuote = {
  quoteId: string
  cryptoAmount: string
  settlementAmountFcfa: number
  rate: number
  feesFcfa: number
  expiresAt: string
  asset: FundingAsset
  network: string
  sgi: { id: string; name: string; channel: string }
  belowSgiMinimum: boolean
  sgiMinimumDepositFcfa: number
  accountOpened: boolean
  mode: string
}

export const FUNDING_PIPELINE = [
  {
    status: 'AWAITING_DEPOSIT',
    title: 'Vous envoyez',
    detail: 'USDT, USDC ou BTC depuis votre portefeuille',
  },
  {
    status: 'DEPOSIT_CONFIRMED',
    title: 'Bitnob reçoit',
    detail: 'Réception confirmée',
  },
  {
    status: 'PAYOUT_PROCESSING',
    title: 'Conversion en FCFA',
    detail: 'Au taux annoncé, frais inclus',
  },
  {
    status: 'DELIVERED_TO_SGI',
    title: 'Versé à la SGI',
    detail: 'Sur son portefeuille de collecte, avec votre référence',
  },
  {
    status: 'CREDITED',
    title: 'Compte crédité',
    detail: 'La SGI confirme votre solde espèces',
  },
]

export const AMOUNT_PRESETS = [25_000, 50_000, 100_000, 250_000]
/** Sandbox: amounts the Bitnob test balance can actually pay out. */
const SANDBOX_PRESETS = [5_000, 7_500, 10_000]

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export const fundings = signal<Funding[]>([])
export const fundingMode = signal<'simulation' | 'sandbox' | 'live'>(
  'simulation',
)
export const asset = signal<FundingAsset>('USDC')
export const senderName = signal('')
export const senderCountry = signal('FR')

/** Sender countries, labelled in French (diaspora first). */
export const SENDER_COUNTRY_OPTIONS = [
  ['FR', 'France'],
  ['US', 'États-Unis'],
  ['CA', 'Canada'],
  ['IT', 'Italie'],
  ['ES', 'Espagne'],
  ['BE', 'Belgique'],
  ['DE', 'Allemagne'],
  ['GB', 'Royaume-Uni'],
  ['SN', 'Sénégal'],
  ['CI', 'Côte d’Ivoire'],
  ['ML', 'Mali'],
  ['BF', 'Burkina Faso'],
  ['NE', 'Niger'],
  ['TG', 'Togo'],
  ['BJ', 'Bénin'],
] as const
export const amountFcfa = signal(50_000)
export const quote = signal<FundingQuote | null>(null)
export const quoting = signal(false)
export const quoteError = signal<string | null>(null)
export const creating = signal(false)
export const actionPending = signal(false)
export const copied = signal(false)
/** Quotes are only requested once the funding screen has been opened. */
export const quotesEnabled = signal(false)

/* -------------------------------------------------------------------------- */
/* Computeds                                                                  */
/* -------------------------------------------------------------------------- */

const FINAL = ['CREDITED', 'FAILED', 'EXPIRED']

export const amountPresets = computed(() =>
  fundingMode.value === 'sandbox' ? SANDBOX_PRESETS : AMOUNT_PRESETS
)

export const activeFunding = computed(() =>
  fundings.value.find((f) => !FINAL.includes(f.status)) ?? null
)

export const pastFundings = computed(() =>
  fundings.value.filter((f) => f.fundingId !== activeFunding.value?.fundingId)
)

/** Progress of the active funding, or of the latest one once credited. */
export const pipelineIndex = computed(() => {
  const latest = activeFunding.value ?? fundings.value[0]
  if (!latest) return -1
  if (latest.status === 'CREDITED') return FUNDING_PIPELINE.length
  return FUNDING_PIPELINE.findIndex((step) => step.status === latest.status)
})

/** SVG markup of the deposit QR code (Lightning invoice or address). */
export const depositQrSvg = computed(() => {
  const instruction = activeFunding.value?.depositInstruction
  if (!instruction) return null
  const qr = qrcode(0, 'M')
  qr.addData(
    activeFunding.value?.asset === 'BTC'
      ? instruction.toUpperCase()
      : instruction,
  )
  qr.make()
  return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true })
})

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export const loadFundings = async () => {
  quotesEnabled.value = true
  try {
    const result = await api.get<
      { mode: typeof fundingMode.value; fundings: Funding[] }
    >(
      '/funding',
    )
    if (result.mode === 'sandbox' && fundingMode.value !== 'sandbox') {
      setAmount(SANDBOX_PRESETS[0])
    }
    fundingMode.value = result.mode
    fundings.value = result.fundings
  } catch (error) {
    showToast(errorMessage(error), 'error')
  }
}

export const setAsset = (value: FundingAsset) => {
  asset.value = value
}

export const setSenderName = (value: string) => {
  senderName.value = value
}

export const setSenderCountry = (value: string) => {
  senderCountry.value = value
}

export const setAmount = (value: number) => {
  amountFcfa.value = Math.max(0, Math.round(value || 0))
}

let quoteTimer: ReturnType<typeof setTimeout> | undefined
let quoteSeq = 0

effect(() => {
  const payload = { asset: asset.value, amountFcfa: amountFcfa.value }
  if (!quotesEnabled.value || activeFunding.value) return
  clearTimeout(quoteTimer)
  quoteTimer = setTimeout(async () => {
    const seq = ++quoteSeq
    quoting.value = true
    try {
      const result = await api.post<FundingQuote>('/funding/quote', payload)
      if (seq === quoteSeq) {
        quote.value = result
        quoteError.value = null
      }
    } catch (error) {
      if (seq === quoteSeq) {
        quote.value = null
        quoteError.value = errorMessage(error)
      }
    } finally {
      if (seq === quoteSeq) quoting.value = false
    }
  }, 300)
})

const upsert = (funding: Funding) => {
  fundings.value = [
    funding,
    ...fundings.value.filter((f) => f.fundingId !== funding.fundingId),
  ]
}

export const createFunding = async () => {
  creating.value = true
  try {
    upsert(
      await api.post<Funding>('/funding', {
        asset: asset.value,
        amountFcfa: amountFcfa.value,
        senderName: senderName.value,
        senderCountry: senderCountry.value,
      }),
    )
  } catch (error) {
    showToast(errorMessage(error), 'error')
  } finally {
    creating.value = false
  }
}

const afterStatusChange = (funding: Funding) => {
  upsert(funding)
  if (funding.status === 'DELIVERED_TO_SGI') {
    showToast(
      `${funding.sgiName} a reçu vos FCFA. Elle confirme le crédit sur votre compte.`,
      'success',
    )
  }
  void loadHome()
  void loadJourney()
}

export const simulateDeposit = async (fundingId: number) => {
  actionPending.value = true
  try {
    afterStatusChange(
      await api.post<Funding>('/funding/simulate-deposit', { fundingId }),
    )
  } catch (error) {
    showToast(errorMessage(error), 'error')
  } finally {
    actionPending.value = false
  }
}

/** Sandbox: the test balance on Bitnob stands in for the crypto deposit. */
export const useSandboxBalance = async (fundingId: number) => {
  actionPending.value = true
  try {
    afterStatusChange(
      await api.post<Funding>('/funding/sandbox-balance', { fundingId }),
    )
  } catch (error) {
    showToast(errorMessage(error), 'error')
  } finally {
    actionPending.value = false
  }
}

export const refreshFunding = async (fundingId: number) => {
  try {
    const funding = await api.post<Funding>('/funding/refresh', { fundingId })
    const previous = fundings.value.find((f) => f.fundingId === fundingId)
      ?.status
    if (previous !== funding.status) afterStatusChange(funding)
  } catch {
    // Polling is best-effort.
  }
}

export const copyInstruction = async () => {
  const value = activeFunding.value?.depositInstruction
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    showToast('Copie impossible : sélectionnez le texte manuellement.', 'error')
  }
}

// Poll Bitnob while a real (non-simulated) funding is in flight.
let pollTimer: ReturnType<typeof setTimeout> | undefined
effect(() => {
  const active = activeFunding.value
  clearInterval(pollTimer)
  if (!active || active.mode === 'simulation') return
  pollTimer = setInterval(() => void refreshFunding(active.fundingId), 10_000)
})
