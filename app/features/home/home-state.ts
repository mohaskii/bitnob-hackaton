import { computed, signal } from '@preact/signals'
import { api } from '../../lib/api.ts'
import { showToast } from '../../state.ts'
import { logout } from '../session/session-state.ts'

/* -------------------------------------------------------------------------- */
/* State Types (Zero interface discipline)                                   */
/* -------------------------------------------------------------------------- */

export type MarketSentimentItem = {
  id: string
  title: string
  status: string
  changeText: string
  isPositive: boolean
  timeframe: string
}

export type RecentNewsItem = {
  id: string
  symbol: string
  company: string
  content: string
  date: string
  source: string
  initial: string
}

export type CommunityTradeActivity = {
  id: string
  traderName: string
  actionType: 'buy' | 'copy'
  targetName: string
  timeAgo: string
  amountDetail: string
  avatarUrl: string
  isCopied: boolean
}

/* -------------------------------------------------------------------------- */
/* State Signals (Rule 1: Signal for every piece of mutable data)              */
/* -------------------------------------------------------------------------- */

export const balanceFcfa = signal<number>(1000000)
export const balanceUsdt = signal<number>(1666.67)

export const marketSentiments = signal<MarketSentimentItem[]>([
  {
    id: 'sentiment-direction',
    title: 'Market Direction',
    status: 'Haussier',
    changeText: '+0.42%',
    isPositive: true,
    timeframe: 'BRVM Composite',
  },
  {
    id: 'sentiment-momentum',
    title: 'Market Momentum',
    status: 'Actif',
    changeText: '48 cotations',
    isPositive: true,
    timeframe: 'Séance officielle',
  },
])

export const recentNews = signal<RecentNewsItem[]>([
  {
    id: 'news-1',
    symbol: 'SNTS',
    company: 'Sonatel',
    content:
      '"Sonatel confirme un dividende record de 1 750 FCFA par action après une hausse de 12% de ses bénéfices portés par les revenus Data et Orange Money au Sénégal et Mali..."',
    date: 'Oct 2026',
    source: 'Financial Afrik',
    initial: 'S',
  },
])

export const communityActivities = signal<CommunityTradeActivity[]>([
  {
    id: 'activity-1',
    traderName: 'Fatou_Invest',
    actionType: 'buy',
    targetName: 'Sonatel',
    timeAgo: 'Il y a 12 min',
    amountDetail: '18 500 FCFA',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    isCopied: false,
  },
  {
    id: 'activity-2',
    traderName: 'Moussa_Dkr',
    actionType: 'copy',
    targetName: 'Fatou_Invest',
    timeAgo: 'Il y a 28 min',
    amountDetail: 'avec 10 000 FCFA',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    isCopied: true,
  },
])

export const isDepositModalOpen = signal<boolean>(false)
export const isWithdrawModalOpen = signal<boolean>(false)
export const isCardModalOpen = signal<boolean>(false)
export const isSidebarOpen = signal<boolean>(false)

/* -------------------------------------------------------------------------- */
/* Derived Computeds (Rule 2: Derived state lives in computed)                */
/* -------------------------------------------------------------------------- */

export const formattedFcfa = computed<string>(() =>
  new Intl.NumberFormat('fr-FR').format(balanceFcfa.value)
)

export const formattedUsdt = computed<string>(() =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balanceUsdt.value)
)

/* -------------------------------------------------------------------------- */
/* Hoisted Actions (Rule 4: Zero functions declared inside components)         */
/* -------------------------------------------------------------------------- */

export const toggleCopyCommunityTrade = (activityId: string) => {
  communityActivities.value = communityActivities.value.map((item) =>
    item.id === activityId ? { ...item, isCopied: !item.isCopied } : item
  )
  showToast('Stratégie copiée avec succès', 'success')
}

export const openDepositModal = () => {
  isDepositModalOpen.value = true
}

export const closeDepositModal = () => {
  isDepositModalOpen.value = false
}

export const openWithdrawModal = () => {
  isWithdrawModalOpen.value = true
}

export const closeWithdrawModal = () => {
  isWithdrawModalOpen.value = false
}

export const openCardModal = () => {
  isCardModalOpen.value = true
}

export const closeCardModal = () => {
  isCardModalOpen.value = false
}

export const openSidebar = () => {
  isSidebarOpen.value = true
}

export const closeSidebar = () => {
  isSidebarOpen.value = false
}

export const handleLogoutFromSidebar = () => {
  closeSidebar()
  void logout()
}

export const loadHome = async () => {
  try {
    const me = await api.get<{
      paper?: { totalValueFcfa: number; cashFcfa: number }
      live?: { totalValueFcfa: number; cashFcfa: number; accountNumber: string }
      funding?: { creditedFcfa: number }
    }>('/me').catch(() => null)

    if (me?.live) {
      const val = me.live.totalValueFcfa > 0
        ? me.live.totalValueFcfa
        : me.live.cashFcfa
      if (val > 0) {
        balanceFcfa.value = val
        balanceUsdt.value = Number((val / 600).toFixed(2))
      }
    } else if (me?.paper) {
      const val = me.paper.totalValueFcfa > 0
        ? me.paper.totalValueFcfa
        : me.paper.cashFcfa
      if (val > 0) {
        balanceFcfa.value = val
        balanceUsdt.value = Number((val / 600).toFixed(2))
      }
    }

    const marketData = await api.get<{
      indices?: Array<{ symbol: string; changePercent: number }>
      latestBulletin?: { title: string; date: string; url: string }
    }>('/market/stocks').catch(() => null)

    if (marketData?.indices?.length) {
      const composite = marketData.indices[0]
      marketSentiments.value = [
        {
          id: 'sentiment-direction',
          title: 'Market Direction',
          status: composite.changePercent >= 0 ? 'Haussier' : 'Baissier',
          changeText: `${composite.changePercent >= 0 ? '+' : ''}${composite.changePercent.toFixed(2)}%`,
          isPositive: composite.changePercent >= 0,
          timeframe: composite.symbol,
        },
        {
          id: 'sentiment-momentum',
          title: 'Market Momentum',
          status: 'Actif',
          changeText: '48 cotations',
          isPositive: true,
          timeframe: 'Séance du jour',
        },
      ]
    }

    if (marketData?.latestBulletin?.title) {
      recentNews.value = [
        {
          id: 'news-boc',
          symbol: 'BRVM',
          company: 'BOC Officiel',
          content: marketData.latestBulletin.title,
          date: marketData.latestBulletin.date || 'Séance officielle',
          source: 'BRVM',
          initial: 'B',
        },
        ...recentNews.value.filter((n) => n.id !== 'news-boc'),
      ]
    }

    const comm = await api.get<{
      posts?: Array<{
        id: string
        authorName: string
        content: string
        symbol?: string
        sentiment?: string
      }>
    }>('/community').catch(() => null)

    if (comm?.posts?.length) {
      const tradePosts = comm.posts.filter((p) => p.symbol)
      if (tradePosts.length) {
        communityActivities.value = tradePosts.slice(0, 3).map((p) => ({
          id: `activity-${p.id}`,
          traderName: p.authorName,
          actionType: p.sentiment === 'bearish' ? 'buy' : 'copy',
          targetName: p.symbol || 'BRVM',
          timeAgo: 'Récemment',
          amountDetail: p.content.slice(0, 45) + '...',
          avatarUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
          isCopied: false,
        }))
      }
    }
  } catch (err) {
    console.warn('[HomeState] loadHome fallback:', err)
  }
}

// Initial fetch
void loadHome()
