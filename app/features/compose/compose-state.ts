import { computed, effect, signal } from '@preact/signals'
import {
  isBottomNavHidden,
  isComposeOpen,
  showToast,
} from '../../state.ts'
import { navigate } from '../../router.tsx'
import { api } from '../../lib/api.ts'
import { user } from '../session/session-state.ts'
import { loadCommunity, trendingAssets } from '../social/social-state.ts'

/* -------------------------------------------------------------------------- */
/* State Types (Zero interface discipline)                                   */
/* -------------------------------------------------------------------------- */

export type AssetOption = {
  symbol: string
  name: string
  price: number
  change: number
}

export const MAX_CHARS = 280
const STROKE_CIRCUMFERENCE = 56.54 // 2 * PI * 9

/* -------------------------------------------------------------------------- */
/* Signals (Rule 1: A signal for every piece of mutable data)                 */
/* -------------------------------------------------------------------------- */

export const composeContent = signal('')
export const composeAudience = signal<'Communauté' | 'Public'>('Communauté')
export const composeReplyRestriction = signal('Tout le monde peut répondre')
export const composeSelectedSymbol = signal<string | null>(null)
export const composeSentiment = signal<'bullish' | 'bearish' | null>(null)
export const composeShowAssetPicker = signal(false)
export const composeIsSubmitting = signal(false)

/* -------------------------------------------------------------------------- */
/* Computeds (Rule 2: Derived state lives in computed)                        */
/* -------------------------------------------------------------------------- */

export const availableComposeAssets = computed<AssetOption[]>(() => {
  const trending = trendingAssets.value
  if (trending.length > 0) {
    return trending.map((t) => ({
      symbol: t.symbol,
      name: t.name,
      price: 0,
      change: t.changePercent,
    }))
  }
  return [
    { symbol: 'SNTS', name: 'Sonatel', price: 0, change: 0 },
    { symbol: 'ORAC', name: 'Orange CI', price: 0, change: 0 },
    { symbol: 'SGBC', name: 'Société Générale CI', price: 0, change: 0 },
    { symbol: 'ETIT', name: 'Ecobank', price: 0, change: 0 },
    { symbol: 'BOAM', name: 'BOA Mali', price: 0, change: 0 },
    { symbol: 'TTLS', name: 'Total Sénégal', price: 0, change: 0 },
  ]
})

export const composeCharCount = computed(() => composeContent.value.length)

export const composeProgressRatio = computed(() =>
  Math.min(composeCharCount.value / MAX_CHARS, 1)
)

export const composeStrokeOffset = computed(
  () =>
    STROKE_CIRCUMFERENCE - composeProgressRatio.value * STROKE_CIRCUMFERENCE,
)

export const composeIsNearLimit = computed(() => composeCharCount.value > 250)

export const composeIsOverLimit = computed(() =>
  composeCharCount.value > MAX_CHARS
)

export const composeCanSubmit = computed(
  () =>
    composeContent.value.trim().length > 0 &&
    !composeIsOverLimit.value &&
    !composeIsSubmitting.value,
)

/* -------------------------------------------------------------------------- */
/* Actions (Rule 4: Hoisted functions at module scope)                        */
/* -------------------------------------------------------------------------- */

export const setComposeContent = (text: string) => {
  composeContent.value = text
}

export const toggleComposeAudience = () => {
  composeAudience.value = composeAudience.value === 'Communauté'
    ? 'Public'
    : 'Communauté'
}

export const toggleComposeReplyRestriction = () => {
  composeReplyRestriction.value =
    composeReplyRestriction.value === 'Tout le monde peut répondre'
      ? 'Abonnés uniquement'
      : 'Tout le monde peut répondre'
}

export const toggleComposeAssetPicker = () => {
  composeShowAssetPicker.value = !composeShowAssetPicker.value
}

export const selectComposeSymbol = (symbol: string) => {
  composeSelectedSymbol.value = composeSelectedSymbol.value === symbol
    ? null
    : symbol
}

export const selectComposeSentiment = (sentiment: 'bullish' | 'bearish') => {
  composeSentiment.value = composeSentiment.value === sentiment
    ? null
    : sentiment
}

export const closeComposeScreen = () => {
  isComposeOpen.value = false
  isBottomNavHidden.value = false
  if (history.length > 1) {
    history.back()
  } else {
    navigate({ href: '/social' })
  }
}

export const submitComposePost = async () => {
  const currentUser = user.value
  if (!currentUser || currentUser.isGuest !== 0) {
    showToast('Vous devez créer un compte vérifié pour publier', 'error')
    return
  }

  const text = composeContent.value.trim()
  if (!text || composeIsOverLimit.value) return

  const symbol = composeSelectedSymbol.value
  const sent = composeSentiment.value

  composeIsSubmitting.value = true

  try {
    await api.post<{ id: string }>('/community/posts', {
      content: text,
      symbol: symbol ?? undefined,
      sentiment: sent ?? undefined,
      tradeAction: symbol
        ? (sent === 'bearish' ? 'VENTE' : 'ACHAT')
        : undefined,
    })

    composeContent.value = ''
    composeSelectedSymbol.value = null
    composeSentiment.value = null
    composeShowAssetPicker.value = false
    closeComposeScreen()
    showToast('Publication partagée avec la communauté', 'success')

    // Refresh community data with authentic server database state
    await loadCommunity()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur lors de la publication'
    showToast(msg, 'error')
  } finally {
    composeIsSubmitting.value = false
  }
}

/* -------------------------------------------------------------------------- */
/* Module Effects                                                             */
/* -------------------------------------------------------------------------- */

effect(() => {
  if (isComposeOpen.value) {
    isBottomNavHidden.value = true
  }
})
