import { computed, signal } from '@preact/signals'
import { api } from '../../lib/api.ts'
import { showToast } from '../../state.ts'
import { navigateUrl } from '../../router.tsx'
import { loadHome } from '../home/home-state.ts'

export type TransferReceipt = {
  transferId: number
  reference: string
  amountFcfa: number
  sender: {
    userId: number
    login: string
  }
  recipient: {
    userId: number
    login: string
  }
  note?: string
  status: 'COMPLETED'
  createdAt: number
}

export type TransferHistoryItem = {
  transferId: number
  reference: string
  amountFcfa: number
  direction: 'SENT' | 'RECEIVED'
  counterparty: {
    userId: number
    login: string
  }
  note?: string
  status: string
  createdAt: number
}

/* -------------------------------------------------------------------------- */
/* State Signals (Rule 1 & Rule 2)                                            */
/* -------------------------------------------------------------------------- */

export const transferRecipient = signal('')
export const transferAmount = signal(10000)
export const transferNote = signal('')
export const isTransferSubmitting = signal(false)
export const transferError = signal<string | null>(null)
export const transferReceipt = signal<TransferReceipt | null>(null)

export const transferHistory = signal<TransferHistoryItem[]>([])
export const isHistoryLoading = signal(false)

export const QUICK_CONTACTS = [
  { id: 'fatou', name: 'Fatou Sall', handle: 'Fatou_Invest' },
  { id: 'moussa', name: 'Moussa Diop', handle: 'Moussa_Dkr' },
  { id: 'amadou', name: 'Amadou Koné', handle: 'Amadou_CI' },
]

export const PRESET_AMOUNTS = [5000, 10000, 25000, 50000]

export const canSubmit = computed(() => {
  return (
    transferRecipient.value.trim().length > 0 &&
    transferAmount.value >= 500 &&
    !isTransferSubmitting.value
  )
})

/* -------------------------------------------------------------------------- */
/* Hoisted Actions (Rule 4)                                                   */
/* -------------------------------------------------------------------------- */

export const setRecipient = (val: string) => {
  transferRecipient.value = val
  transferError.value = null
}

export const setAmount = (val: number) => {
  transferAmount.value = Math.max(500, Math.round(val || 0))
}

export const setNote = (val: string) => {
  transferNote.value = val
}

export const resetTransferForm = () => {
  transferRecipient.value = ''
  transferAmount.value = 10000
  transferNote.value = ''
  transferError.value = null
  transferReceipt.value = null
}

export const submitTransfer = async () => {
  const cleanRecipient = transferRecipient.value.trim()
  if (!cleanRecipient) {
    transferError.value = 'Veuillez saisir le @pseudo ou email du destinataire.'
    return
  }
  if (transferAmount.value < 500) {
    transferError.value = 'Le montant minimum est de 500 FCFA.'
    return
  }

  isTransferSubmitting.value = true
  transferError.value = null

  try {
    const res = await api.post<TransferReceipt>('/transfers', {
      recipient: cleanRecipient,
      amountFcfa: transferAmount.value,
      note: transferNote.value.trim() || undefined,
    })

    transferReceipt.value = res
    showToast(
      `Transfert de ${res.amountFcfa.toLocaleString('fr-FR')} FCFA envoyé à @${res.recipient.login}`,
      'success',
    )
    void loadHome()
  } catch (err: any) {
    transferError.value = err?.message || 'Erreur lors du transfert de fonds.'
  } finally {
    isTransferSubmitting.value = false
  }
}

export const loadHistory = async () => {
  isHistoryLoading.value = true
  try {
    const res = await api.get<{ transfers: TransferHistoryItem[] }>('/transfers')
    transferHistory.value = res.transfers || []
  } catch {
    transferHistory.value = []
  } finally {
    isHistoryLoading.value = false
  }
}

export const navigateToTransfer = () => {
  resetTransferForm()
  navigateUrl('/transfer')
}

export const navigateToHistory = () => {
  void loadHistory()
  navigateUrl('/history')
}

export const navigateBackFromTransfer = () => {
  resetTransferForm()
  navigateUrl('/')
}
