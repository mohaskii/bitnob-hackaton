import { computed, effect, signal } from '@preact/signals'
import {
  addSocialPost,
  CURRENT_USER,
  isBottomNavHidden,
  isComposeOpen,
  type SocialPost,
} from '../../state.ts'
import { navigate } from '../../router.tsx'

/* -------------------------------------------------------------------------- */
/* State Types (Zero interface discipline)                                   */
/* -------------------------------------------------------------------------- */

export type AssetOption = {
  symbol: string
  name: string
  price: number
  change: number
}

export const POPULAR_ASSETS: AssetOption[] = [
  { symbol: 'SNTS', name: 'Sonatel', price: 18500, change: 1.85 },
  { symbol: 'BTC', name: 'Bitcoin', price: 41250000, change: 2.40 },
  { symbol: 'ORAC', name: 'Orange CI', price: 11200, change: 0.65 },
  { symbol: 'SGBC', name: 'Société Générale', price: 21000, change: 2.44 },
  { symbol: 'USDT', name: 'Tether USD', price: 615, change: 0.05 },
]

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

/* -------------------------------------------------------------------------- */
/* Computeds (Rule 2: Derived state lives in computed)                        */
/* -------------------------------------------------------------------------- */

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
  () => composeContent.value.trim().length > 0 && !composeIsOverLimit.value,
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

export const submitComposePost = () => {
  const text = composeContent.value.trim()
  if (!text || composeIsOverLimit.value) return

  const symbol = composeSelectedSymbol.value
  const matchedAsset = POPULAR_ASSETS.find((a) => a.symbol === symbol)
  const sent = composeSentiment.value

  const newPost: SocialPost = {
    id: `post-${Date.now()}`,
    authorName: CURRENT_USER.name,
    authorHandle: CURRENT_USER.handle,
    avatarUrl: CURRENT_USER.avatarUrl,
    verified: CURRENT_USER.verified,
    timeAgo: "À l'instant",
    content: text,
    trade: symbol && matchedAsset
      ? {
        symbol: matchedAsset.symbol,
        action: sent === 'bearish' ? 'VENTE' : 'ACHAT',
        priceFcfa: matchedAsset.price,
        changePercent: matchedAsset.change,
      }
      : undefined,
    sentiment: sent || undefined,
    likesCount: 0,
    isLiked: false,
    commentsCount: 0,
    copiersCount: 0,
  }

  addSocialPost(newPost)
  composeContent.value = ''
  composeSelectedSymbol.value = null
  composeSentiment.value = null
  composeShowAssetPicker.value = false
  closeComposeScreen()
}

/* -------------------------------------------------------------------------- */
/* Module Effects                                                             */
/* -------------------------------------------------------------------------- */

effect(() => {
  if (isComposeOpen.value) {
    isBottomNavHidden.value = true
  }
})
