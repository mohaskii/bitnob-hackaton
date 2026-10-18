import { signal } from '@preact/signals'
import { api, errorMessage } from '../../lib/api.ts'
import { showToast } from '../../state.ts'
import type { Funding } from '../funding/funding-state.ts'

export type PartnerOverview = {
  sgi: { id: string; name: string; isDemo: boolean }
  funnel: { id: string; label: string; value: number }[]
  applications: {
    journeyId: number
    applicant: string
    status: string
    statusLabel: string
    submittedAt: number | null
    updatedAt: number
    documentsReady: number
    documentsTotal: number
  }[]
  partnerStatuses: { status: string; label: string }[]
}

export type PartnerFunding = Funding & { applicant: string }

export const partnerSgiId = signal('atlantique')
export const overview = signal<PartnerOverview | null>(null)
export const partnerFundings = signal<PartnerFunding[]>([])
export const partnerError = signal<string | null>(null)

export const loadPartner = async () => {
  try {
    const [o, f] = await Promise.all([
      api.get<PartnerOverview>(`/partner/overview?sgiId=${partnerSgiId.value}`),
      api.get<{ fundings: PartnerFunding[] }>(
        `/partner/fundings?sgiId=${partnerSgiId.value}`,
      ),
    ])
    overview.value = o
    partnerFundings.value = f.fundings
    partnerError.value = null
  } catch (error) {
    partnerError.value = errorMessage(error)
  }
}

export const setPartnerSgi = (sgiId: string) => {
  partnerSgiId.value = sgiId
  void loadPartner()
}

export const setApplicationStatus = async (
  journeyId: number,
  status: string,
) => {
  try {
    overview.value = await api.post<PartnerOverview>('/partner/status', {
      sgiId: partnerSgiId.value,
      journeyId,
      status,
    })
    showToast(
      'Statut mis à jour. Le prospect le voit dans son parcours.',
      'success',
    )
  } catch (error) {
    showToast(errorMessage(error), 'error')
  }
}

export const confirmFundingCredit = async (fundingId: number) => {
  try {
    const result = await api.post<{ fundings: PartnerFunding[] }>(
      '/partner/fundings/credit',
      {
        sgiId: partnerSgiId.value,
        fundingId,
      },
    )
    partnerFundings.value = result.fundings
    void loadPartner()
    showToast(
      'Crédit confirmé : le compte du client est approvisionné.',
      'success',
    )
  } catch (error) {
    showToast(errorMessage(error), 'error')
  }
}
