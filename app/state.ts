import { signal } from '@preact/signals'

/* -------------------------------------------------------------------------- */
/* Types & Interfaces                                                         */
/* -------------------------------------------------------------------------- */

export interface Trader {
  id: string
  name: string
  handle: string
  avatarUrl: string
  verified: boolean
  returnPercent: number
  timeframe: string
  copiersCount: number
  winRate: number
  riskLevel: 'Faible' | 'Modéré' | 'Élevé'
  isCopied: boolean
  badge?: string
}

export interface TrendingAsset {
  id: string
  symbol: string
  name: string
  postCount: number
  changePercent: number
  logoBg: string
  logoText: string
}

export interface SocialPost {
  id: string
  authorName: string
  authorHandle: string
  avatarUrl: string
  verified: boolean
  timeAgo: string
  content: string
  trade?: {
    symbol: string
    action: 'ACHAT' | 'VENTE'
    priceFcfa: number
    changePercent: number
  }
  sentiment?: 'bullish' | 'bearish'
  likesCount: number
  isLiked: boolean
  commentsCount: number
  copiersCount: number
}

export const CURRENT_USER = {
  name: 'Vous',
  handle: 'Moi_Trader',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  verified: true,
}

export const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    authorName: 'Fatou Sall',
    authorHandle: 'Fatou_Invest',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    verified: true,
    timeAgo: 'Il y a 14 min',
    content:
      "Dividende record confirmé pour Sonatel à 1 750 FCFA par part ! Je viens de renforcer ma position avec 25 parts via le solde Lightning Bitnob. Objectif 20 000 FCFA d'ici la clôture annuelle.",
    trade: {
      symbol: 'SNTS',
      action: 'ACHAT',
      priceFcfa: 18500,
      changePercent: 1.85,
    },
    sentiment: 'bullish',
    likesCount: 34,
    isLiked: false,
    commentsCount: 8,
    copiersCount: 19,
  },
  {
    id: 'post-2',
    authorName: 'Amadou Koné',
    authorHandle: 'Amadou_CI',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    verified: true,
    timeAgo: 'Il y a 45 min',
    content:
      'Prise de bénéfices partielle sur SGBC (+14% sur 2 semaines). Je bascule 50% des gains en USDT stables sur ma carte virtuelle Bitnob pour sécuriser la performance.',
    trade: {
      symbol: 'SGBC',
      action: 'VENTE',
      priceFcfa: 21000,
      changePercent: 2.44,
    },
    sentiment: 'bullish',
    likesCount: 22,
    isLiked: true,
    commentsCount: 5,
    copiersCount: 12,
  },
  {
    id: 'post-3',
    authorName: 'Moussa Diop',
    authorHandle: 'Moussa_Dkr',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    verified: true,
    timeAgo: 'Il y a 2h',
    content:
      "Orange Côte d'Ivoire consolide sous les 11 300 FCFA. C'est une zone d'accumulation parfaite pour les investisseurs orientés dividendes de long terme.",
    trade: {
      symbol: 'ORAC',
      action: 'ACHAT',
      priceFcfa: 11200,
      changePercent: 0.65,
    },
    sentiment: 'bullish',
    likesCount: 18,
    isLiked: false,
    commentsCount: 3,
    copiersCount: 7,
  },
]

/* -------------------------------------------------------------------------- */
/* Global UI & Data State Signals                                             */
/* -------------------------------------------------------------------------- */

export const isBottomNavHidden = signal(false)
export const isComposeOpen = signal(false)
export const socialPosts = signal<SocialPost[]>(INITIAL_POSTS)

/**
 * Add a new post to the community feed
 */
export const addSocialPost = (post: SocialPost) => {
  socialPosts.value = [post, ...socialPosts.value]
}

/**
 * Toggle like status on a post
 */
export const toggleLikeSocialPost = (postId: string) => {
  socialPosts.value = socialPosts.value.map((p) =>
    p.id === postId
      ? {
        ...p,
        isLiked: !p.isLiked,
        likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
      }
      : p
  )
}
