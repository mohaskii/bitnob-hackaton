import { computed, signal } from '@preact/signals'

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

export const balanceFcfa = signal<number>(209890)
export const balanceUsdt = signal<number>(345.20)

export const marketSentiments = signal<MarketSentimentItem[]>([
  {
    id: 'sentiment-direction',
    title: 'Market Direction',
    status: 'Bearish',
    changeText: '-1.321%',
    isPositive: false,
    timeframe: 'last 7 day',
  },
  {
    id: 'sentiment-momentum',
    title: 'Market Momentum',
    status: 'Bullish',
    changeText: '+0.1673',
    isPositive: true,
    timeframe: 'last 7 day',
  },
])

export const recentNews = signal<RecentNewsItem[]>([
  {
    id: 'news-1',
    symbol: 'SNTS',
    company: 'Sonatel',
    content:
      '"Sonatel confirme un dividende record de 1 750 FCFA par action après une hausse de 12% de ses bénéfices portés par les revenus Data et Orange Money au Sénégal et Mali..."',
    date: 'Oct 08, 2026',
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
