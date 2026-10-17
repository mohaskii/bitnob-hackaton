import { computed, effect, signal } from '@preact/signals'
import {
  isBottomNavHidden,
  isComposeOpen,
  showToast,
  SocialPost,
  socialPosts,
  toggleLikeSocialPost,
  Trader,
  TrendingAsset,
} from '../../state.ts'
import { api } from '../../lib/api.ts'
import { relativeTime } from '../../lib/format.ts'

/* -------------------------------------------------------------------------- */
/* Static Initial / Fallback Data                                             */
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

export const loadCommunity = async () => {
  try {
    const data = await api.get<{
      traders?: Array<{
        id?: string
        traderId?: number
        name: string
        handle: string
        avatarUrl: string
        returnPercent: number
        timeframe: string
        followersCount: number
        winRate: number
        riskLevel: string
        badge: string | null
        isFollowed?: boolean
      }>
      posts?: Array<{
        id?: string
        postId?: number
        authorName: string
        authorHandle: string
        avatarUrl: string
        content: string
        symbol: string | null
        sentiment: string | null
        likesCount: number
        commentsCount: number
        createdAt: number
      }>
    }>('/community')

    if (data?.traders?.length) {
      traders.value = data.traders.map((t) => ({
        id: String(t.id || t.traderId),
        name: t.name,
        handle: t.handle,
        avatarUrl: t.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        verified: true,
        returnPercent: t.returnPercent,
        timeframe: t.timeframe || '30 derniers jours',
        copiersCount: t.followersCount || 42,
        winRate: t.winRate || 75,
        riskLevel: (t.riskLevel as 'Faible' | 'Modéré' | 'Élevé') || 'Faible',
        isCopied: Boolean(t.isFollowed),
        badge: t.badge || 'Trader BRVM',
      }))
    }

    if (data?.posts?.length) {
      socialPosts.value = data.posts.map((p) => ({
        id: String(p.id || p.postId),
        authorName: p.authorName,
        authorHandle: p.authorHandle,
        avatarUrl: p.avatarUrl ||
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
        verified: true,
        timeAgo: relativeTime(p.createdAt),
        content: p.content,
        trade: p.symbol
          ? {
            symbol: p.symbol,
            action: p.sentiment === 'bearish' ? 'VENTE' : 'ACHAT',
            priceFcfa: 18500,
            changePercent: p.sentiment === 'bearish' ? -1.5 : 2.1,
          }
          : undefined,
        sentiment: (p.sentiment as 'bullish' | 'bearish') || undefined,
        likesCount: p.likesCount || 0,
        isLiked: false,
        commentsCount: p.commentsCount || 0,
        copiersCount: 14,
      }))
    }
  } catch (err) {
    console.warn('[Community] Failed to load from backend, using fallback:', err)
  }
}

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

export const confirmCopy = async () => {
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
    showToast(`Copie de ${target.name} activée avec succès`, 'success')
    void api.post('/community/follow', { traderId: target.id, follow: true })
      .catch(() => {})
  }
  closeCopyModal()
}

export const toggleCopyTrader = async (trader: Trader) => {
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
    showToast(`Copie de ${trader.name} révoquée`, 'info')
    void api.post('/community/follow', { traderId: trader.id, follow: false })
      .catch(() => {})
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
  void api.post('/community/posts/like', { postId }).catch(() => {})
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

// Initial load from backend
void loadCommunity()
