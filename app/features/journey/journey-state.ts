import { computed, signal } from '@preact/signals'
import { api, errorMessage } from '../../lib/api.ts'
import { showToast } from '../../state.ts'
import { loadHome } from '../home/home-state.ts'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ChecklistItem = {
  id: string
  label: string
  hint: string
  required: boolean
  done?: boolean
}

export type SgiPartner = {
  id: string
  name: string
  tagline: string
  country: string
  isDemo: boolean
  verifiedAt: string | null
  source: string
  schedule: {
    brokerageRate: number
    brokerageMinFcfa: number
    taxOnBrokerageRate: number
  }
  minimumDepositFcfa: number
  custodyFeeLabel: string
  openingMode: string
  openingDelayLabel: string
  fundingMethods: string[]
  highlights: string[]
  checklist: ChecklistItem[]
  accentColor: string
  bitnobCollection: {
    available: boolean
    country: string
    channel: string
    maxPerTransferFcfa: number
  }
}

export type JourneyStep = {
  id: string
  title: string
  description: string
  done: boolean
  cta: { label: string; path: string }
}

export type Journey = {
  journeyId: number
  status: string
  statusLabel: string
  sgiId: string | null
  checklist: (ChecklistItem & { done: boolean })[]
  checklistReady: boolean
  consentAt: number | null
  submittedAt: number | null
  timeline: {
    status: string
    label: string
    note: string | null
    createdAt: number
  }[]
  steps: JourneyStep[]
  completedCount: number
  nextStepId: string | null
}

/** Example order used to compare SGI costs side by side. */
export const COMPARE_AMOUNT_FCFA = 100_000

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export const partners = signal<SgiPartner[]>([])
export const journey = signal<Journey | null>(null)
export const journeyError = signal<string | null>(null)
export const consentChecked = signal(false)
export const submitting = signal(false)
export const changingSgi = signal(false)

/* -------------------------------------------------------------------------- */
/* Computeds                                                                  */
/* -------------------------------------------------------------------------- */

export const selectedSgi = computed(() =>
  partners.value.find((sgi) => sgi.id === journey.value?.sgiId) ?? null
)

const STATUS_ORDER = [
  'EXPLORING',
  'SGI_SELECTED',
  'SUBMITTED',
  'UNDER_REVIEW',
  'INFO_REQUESTED',
  'ACCOUNT_OPENED',
  'FUNDED',
]

export const isSubmitted = computed(() =>
  STATUS_ORDER.indexOf(journey.value?.status ?? 'EXPLORING') >=
    STATUS_ORDER.indexOf('SUBMITTED')
)

export const isAccountOpen = computed(() =>
  STATUS_ORDER.indexOf(journey.value?.status ?? 'EXPLORING') >=
    STATUS_ORDER.indexOf('ACCOUNT_OPENED')
)

/** Fees on a 100 000 FCFA buy for each SGI, same formula as the server. */
export const comparison = computed(() =>
  partners.value.map((sgi) => {
    const brokerage = Math.round(
      Math.max(
        COMPARE_AMOUNT_FCFA * sgi.schedule.brokerageRate,
        sgi.schedule.brokerageMinFcfa,
      ),
    )
    const tax = Math.round(brokerage * sgi.schedule.taxOnBrokerageRate)
    const market = Math.round(COMPARE_AMOUNT_FCFA * 0.003)
    return { sgi, totalFeesFcfa: brokerage + tax + market }
  })
)

export const cheapestSgiId = computed(() =>
  comparison.value.reduce<{ id: string; fees: number } | null>(
    (best, row) =>
      !best || row.totalFeesFcfa < best.fees
        ? { id: row.sgi.id, fees: row.totalFeesFcfa }
        : best,
    null,
  )?.id ?? null
)

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export const loadJourney = async () => {
  try {
    const [catalogue, current] = await Promise.all([
      partners.value.length
        ? Promise.resolve({ partners: partners.value })
        : api.get<{ partners: SgiPartner[] }>('/sgi'),
      api.get<Journey>('/journey'),
    ])
    partners.value = catalogue.partners
    journey.value = current
    journeyError.value = null
  } catch (error) {
    journeyError.value = errorMessage(error)
  }
}

export const trackCompared = () => {
  void api.post('/events', { type: 'compared_sgi' }).catch(() => {})
}

export const chooseSgi = async (sgiId: string) => {
  try {
    journey.value = await api.post<Journey>('/journey/sgi', { sgiId })
    changingSgi.value = false
    void loadHome()
  } catch (error) {
    showToast(errorMessage(error), 'error')
  }
}

export const startChangeSgi = () => {
  changingSgi.value = true
}

export const toggleChecklistItem = async (itemId: string, done: boolean) => {
  try {
    journey.value = await api.post<Journey>('/journey/checklist', {
      itemId,
      done,
    })
  } catch (error) {
    showToast(errorMessage(error), 'error')
  }
}

export const setConsent = (value: boolean) => {
  consentChecked.value = value
}

export const submitFile = async () => {
  submitting.value = true
  try {
    journey.value = await api.post<Journey>('/journey/submit', {
      consent: consentChecked.value,
    })
    showToast(
      'Dossier transmis à la SGI. Vous suivez son statut ici.',
      'success',
    )
    void loadHome()
  } catch (error) {
    showToast(errorMessage(error), 'error')
  } finally {
    submitting.value = false
  }
}
