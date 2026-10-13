import { signal } from '@preact/signals'

/* -------------------------------------------------------------------------- */
/* Global UI state shared across features                                     */
/* -------------------------------------------------------------------------- */

export type Toast = {
  id: number
  tone: 'success' | 'error' | 'info'
  message: string
}

export const isBottomNavHidden = signal(false)
export const toasts = signal<Toast[]>([])

let toastId = 0

export const showToast = (message: string, tone: Toast['tone'] = 'info') => {
  const id = ++toastId
  toasts.value = [...toasts.value, { id, tone, message }]
  setTimeout(() => dismissToast(id), 4200)
}

export const dismissToast = (id: number) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}
