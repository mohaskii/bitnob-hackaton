import { computed, signal } from '@preact/signals'
import { api, errorMessage } from '../../lib/api.ts'
import type { Journey, SgiPartner } from '../journey/journey-state.ts'
import type { Funding } from '../funding/funding-state.ts'

export type HomeSummary = {
  user: { userId: number; email: string; login: string; isGuest: number }
  paper: {
    totalValueFcfa: number
    totalPnlFcfa: number
    totalPnlPercent: number
    cashFcfa: number
    positionsCount: number
  }
  funding: {
    mode: 'simulation' | 'sandbox' | 'live'
    creditedFcfa: number
    latest: Funding | null
  }
  journey: Journey
  sgi: SgiPartner | null
}

export const home = signal<HomeSummary | null>(null)
export const homeError = signal<string | null>(null)

export const nextStep = computed(() => {
  const journey = home.value?.journey
  if (!journey) return null
  return journey.steps.find((step) => step.id === journey.nextStepId) ?? null
})

export const journeyProgress = computed(() => {
  const journey = home.value?.journey
  if (!journey) return 0
  return Math.round((journey.completedCount / journey.steps.length) * 100)
})

export const loadHome = async () => {
  try {
    home.value = await api.get<HomeSummary>('/me')
    homeError.value = null
  } catch (error) {
    homeError.value = errorMessage(error)
  }
}
