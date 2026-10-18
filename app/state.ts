import { signal } from '@preact/signals'

/* -------------------------------------------------------------------------- */
/* State Types (Zero interface discipline)                                   */
/* -------------------------------------------------------------------------- */


export type TrendingAsset = {
  id: string
  symbol: string
  name: string
  postCount: number
  changePercent: number
  logoBg: string
  logoText: string
}

export type SocialPostTrade = {
  symbol: string
  action: 'ACHAT' | 'VENTE'
  priceFcfa: number
  changePercent: number
}

export type SocialPost = {
  id: string
  authorName: string
  authorHandle: string
  avatarUrl: string
  verified: boolean
  timeAgo: string
  content: string
  trade?: SocialPostTrade
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

export const INITIAL_POSTS: SocialPost[] = []

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
export const toggleLikeSocialPost = (
  postId: string,
  forcedLiked?: boolean,
  newCount?: number,
) => {
  socialPosts.value = socialPosts.value.map((p) => {
    if (p.id !== postId) return p
    const isLiked = forcedLiked !== undefined ? forcedLiked : !p.isLiked
    const likesCount = newCount !== undefined
      ? newCount
      : (isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1))
    return { ...p, isLiked, likesCount }
  })
}

export const toasts = signal<{ id: number; tone: 'success' | 'error' | 'info'; message: string }[]>([])

let toastId = 0

export const showToast = (message: string, tone: 'success' | 'error' | 'info' = 'info') => {
  const id = ++toastId
  toasts.value = [...toasts.value, { id, tone, message }]
  setTimeout(() => dismissToast(id), 4200)
}

export const dismissToast = (id: number) => {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}
