import { computed, effect, signal } from '@preact/signals'
import { tekkiApi } from '../tekki/tekki-api.ts'
import {
  isBottomNavHidden,
  isComposeOpen,
  SocialPost,
  socialPosts,
  toggleLikeSocialPost,
  Trader,
  TrendingAsset,
} from '../../state.ts'

/* -------------------------------------------------------------------------- */
/* Static Mock Data (Pure constants)                                          */
/* -------------------------------------------------------------------------- */

export const INITIAL_TRADERS: Trader[] = [
  {
    id: 'trader-1',
    name: 'Fatou Sall',
    handle: 'Fatou_Invest',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    verified: true,
    returnPercent: 38.4,
    timeframe: '30 derniers jours',
    copiersCount: 142,
    winRate: 82,
    riskLevel: 'Faible',
    isCopied: true,
    badge: 'Top 1% BRVM',
  },
  {
    id: 'trader-2',
    name: 'Moussa Diop',
    handle: 'Moussa_Dkr',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    verified: true,
    returnPercent: 26.8,
    timeframe: '30 derniers jours',
    copiersCount: 98,
    winRate: 75,
    riskLevel: 'Modéré',
    isCopied: false,
    badge: 'Spécialiste Télécoms',
  },
  {
    id: 'trader-3',
    name: 'Amadou Koné',
    handle: 'Amadou_CI',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    verified: true,
    returnPercent: 44.1,
    timeframe: '30 derniers jours',
    copiersCount: 175,
    winRate: 86,
    riskLevel: 'Faible',
    isCopied: false,
    badge: 'Pro Dividendes',
  },
  {
    id: 'trader-4',
    name: 'Sarah Traoré',
    handle: 'Sarah_Finance',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    verified: true,
    returnPercent: 19.5,
    timeframe: '30 derniers jours',
    copiersCount: 64,
    winRate: 71,
    riskLevel: 'Faible',
    isCopied: false,
  },
]

export const TRENDING_ASSETS: TrendingAsset[] = [
  {
    id: 'snts',
    symbol: 'SNTS',
    name: 'Sonatel',
    postCount: 142,
    changePercent: 1.85,
    logoBg: 'bg-primary/20 text-primary-content',
    logoText: 'SN',
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin / Lightning',
    postCount: 98,
    changePercent: 2.40,
    logoBg: 'bg-warning/20 text-warning-content',
    logoText: '₿',
  },
  {
    id: 'orac',
    symbol: 'ORAC',
    name: 'Orange CI',
    postCount: 86,
    changePercent: 0.65,
    logoBg: 'bg-warning/20 text-warning-content',
    logoText: 'OR',
  },
  {
    id: 'sgbc',
    symbol: 'SGBC',
    name: 'Société Générale CI',
    postCount: 72,
    changePercent: 2.44,
    logoBg: 'bg-error/20 text-error',
    logoText: 'SG',
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    postCount: 54,
    changePercent: 0.05,
    logoBg: 'bg-success/20 text-success',
    logoText: '₮',
  },
  {
    id: 'etit',
    symbol: 'ETIT',
    name: 'Ecobank Transnational',
    postCount: 41,
    changePercent: -1.20,
    logoBg: 'bg-info/20 text-info',
    logoText: 'ET',
  },
]

/* -------------------------------------------------------------------------- */
/* Signals (Rule 1: A signal for every piece of mutable data)                 */
/* -------------------------------------------------------------------------- */

export const traders = signal<Trader[]>(INITIAL_TRADERS)
export const activeFilterSymbol = signal<string | null>(null)

// Copy-Trading Modal Sheet State
export const copyingTrader = signal<Trader | null>(null)
export const copyAmount = signal<number>(25000)
export const copyStopLoss = signal<number>(15)
export const copyOpenTrades = signal<boolean>(true)

/* -------------------------------------------------------------------------- */
/* Computeds (Rule 2: Derived state lives in computed)                        */
/* -------------------------------------------------------------------------- */

export const filteredPosts = computed<SocialPost[]>(() => {
  const filter = activeFilterSymbol.value
  const allPosts = socialPosts.value
  return filter ? allPosts.filter((p) => p.trade?.symbol === filter) : allPosts
})

/* -------------------------------------------------------------------------- */
/* Actions (Rule 4: Hoisted functions at module scope)                        */
/* -------------------------------------------------------------------------- */

export const setActiveFilterSymbol = (symbol: string | null) => {
  activeFilterSymbol.value = symbol
}

export const openCopyModal = (trader: Trader) => {
  copyingTrader.value = trader
  isBottomNavHidden.value = true
}

export const closeCopyModal = () => {
  copyingTrader.value = null
  if (!isComposeOpen.value) {
    isBottomNavHidden.value = false
  }
}

export const setCopyAmount = (amt: number) => {
  copyAmount.value = amt
}

export const setCopyStopLoss = (pct: number) => {
  copyStopLoss.value = pct
}

export const toggleCopyOpenTrades = (val: boolean) => {
  copyOpenTrades.value = val
}

export const confirmCopy = () => {
  const target = copyingTrader.value
  if (target) {
    traders.value = traders.value.map((t) =>
      t.id === target.id
        ? {
          ...t,
          isCopied: true,
          copiersCount: t.isCopied ? t.copiersCount : t.copiersCount + 1,
        }
        : t
    )
  }
  closeCopyModal()
}

export const toggleCopyTrader = (trader: Trader) => {
  if (trader.isCopied) {
    traders.value = traders.value.map((t) =>
      t.id === trader.id
        ? {
          ...t,
          isCopied: false,
          copiersCount: t.copiersCount - 1,
        }
        : t
    )
  } else {
    openCopyModal(trader)
  }
}

export const handleCopyPostTrade = (post: SocialPost) => {
  const matchedTrader = traders.value.find((t) =>
    t.handle === post.authorHandle
  )
  if (matchedTrader) {
    toggleCopyTrader(matchedTrader)
  } else {
    openCopyModal({
      id: post.id,
      name: post.authorName,
      handle: post.authorHandle,
      avatarUrl: post.avatarUrl,
      verified: post.verified,
      returnPercent: 32.5,
      timeframe: '30 derniers jours',
      copiersCount: post.copiersCount,
      winRate: 80,
      riskLevel: 'Faible',
      isCopied: false,
    })
  }
}

export const toggleLikePost = (postId: string) => {
  toggleLikeSocialPost(postId)
}

export const openCompose = () => {
  isComposeOpen.value = true
  isBottomNavHidden.value = true
}

export const scrollHorizontal = (
  element: HTMLDivElement | null,
  direction: 'left' | 'right',
  amount = 240,
) => {
  if (element) {
    element.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }
}

/* -------------------------------------------------------------------------- */
/* Module Effects                                                             */
/* -------------------------------------------------------------------------- */

effect(() => {
  const isModalOpen = copyingTrader.value !== null || isComposeOpen.value
  isBottomNavHidden.value = isModalOpen
})

/* -------------------------------------------------------------------------- */
/* Tekki Analytics: profile metrics computed from recorded trade logs         */
/* -------------------------------------------------------------------------- */

/** handle → traderId, for feed posts. */
export const traderIdByHandle = computed(() =>
  Object.fromEntries(traders.value.map((t) => [t.handle, t.id]))
)

let analyticsLoaded = false
export const loadTraderAnalytics = async () => {
  if (analyticsLoaded) return
  analyticsLoaded = true
  try {
    const { traders: computedTraders } = await tekkiApi.traders()
    const byId = Object.fromEntries(computedTraders.map((t) => [t.traderId, t]))
    traders.value = traders.value.map((t) => {
      const a = byId[t.id]?.analytics
      return a
        ? {
          ...t,
          returnPercent: a.performancePercent,
          winRate: a.winRatePercent ?? 0,
          timeframe: `${a.closedTrades} trades clôturés`,
          verified: false,
          badge: 'Profil d’exemple',
        }
        : t
    })
  } catch {
    analyticsLoaded = false
  }
}

/** Follow / unfollow a profile. No copy contract, no automatic order. */
export const toggleFollowTrader = (trader: Trader) => {
  traders.value = traders.value.map((t) =>
    t.id === trader.id
      ? {
        ...t,
        isCopied: !t.isCopied,
        copiersCount: t.isCopied ? t.copiersCount - 1 : t.copiersCount + 1,
      }
      : t
  )
}
