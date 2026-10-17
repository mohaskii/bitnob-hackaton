import { computed, effect, signal } from '@preact/signals'
import {
  isBottomNavHidden,
  isComposeOpen,
  showToast,
  SocialPost,
  socialPosts,
  toggleLikeSocialPost,
  TrendingAsset,
} from '../../state.ts'
import { api } from '../../lib/api.ts'
import { relativeTime } from '../../lib/format.ts'

/* -------------------------------------------------------------------------- */
/* Static Fallback Data                                                       */
/* -------------------------------------------------------------------------- */

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

export const trendingAssets = signal<TrendingAsset[]>(TRENDING_ASSETS)
export const activeFilterSymbol = signal<string | null>(null)

// Comments Drawer State
export const activeCommentsPost = signal<SocialPost | null>(null)
export const postCommentsList = signal<Array<{
  id: string
  authorName: string
  authorHandle?: string
  content: string
  createdAt: number
}>>([])
export const commentInputText = signal('')
export const isCommentsLoading = signal(false)

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
      posts?: Array<{
        id?: string
        postId?: number
        authorName: string
        authorHandle: string
        avatarUrl: string
        content: string
        symbol: string | null
        sentiment: string | null
        trade?: {
          symbol: string
          action: 'ACHAT' | 'VENTE'
          priceFcfa: number
          changePercent: number
        } | null
        likesCount: number
        commentsCount: number
        createdAt: number
      }>
      trending?: TrendingAsset[]
    }>('/community')

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
        trade: p.trade
          ? {
            symbol: p.trade.symbol,
            action: p.trade.action,
            priceFcfa: p.trade.priceFcfa,
            changePercent: p.trade.changePercent,
          }
          : undefined,
        sentiment: (p.sentiment as 'bullish' | 'bearish') || undefined,
        likesCount: p.likesCount || 0,
        isLiked: false,
        commentsCount: p.commentsCount || 0,
        copiersCount: 0,
      }))
    }

    if (data?.trending?.length) {
      trendingAssets.value = data.trending
    }
  } catch (err) {
    console.warn('[Community] Failed to load from backend, using fallback:', err)
  }
}

export const setActiveFilterSymbol = (symbol: string | null) => {
  activeFilterSymbol.value = symbol
}

export const toggleLikePost = (postId: string) => {
  toggleLikeSocialPost(postId)
  void api.post('/community/posts/like', { postId }).catch(() => {})
}

export const openCompose = () => {
  isComposeOpen.value = true
  isBottomNavHidden.value = true
}

/* -------------------------------------------------------------------------- */
/* Comments Drawer Actions                                                    */
/* -------------------------------------------------------------------------- */

export const openCommentsModal = async (post: SocialPost) => {
  activeCommentsPost.value = post
  isBottomNavHidden.value = true
  isCommentsLoading.value = true
  commentInputText.value = ''
  try {
    const res = await api.get<{
      comments: Array<{
        id: string
        authorName: string
        content: string
        createdAt: number
      }>
    }>(`/community/posts/comments?postId=${post.id}`)
    postCommentsList.value = res?.comments ?? []
  } catch {
    postCommentsList.value = []
  } finally {
    isCommentsLoading.value = false
  }
}

export const closeCommentsModal = () => {
  activeCommentsPost.value = null
  if (!isComposeOpen.value) {
    isBottomNavHidden.value = false
  }
}

export const setCommentInputText = (text: string) => {
  commentInputText.value = text
}

export const submitComment = async () => {
  const post = activeCommentsPost.value
  const text = commentInputText.value.trim()
  if (!post || !text) return

  try {
    const res = await api.post<{
      id: string
      authorName: string
      content: string
      createdAt: number
    }>('/community/posts/comments', {
      postId: post.id,
      content: text,
    })

    if (res?.id) {
      postCommentsList.value = [
        ...postCommentsList.value,
        {
          id: res.id,
          authorName: res.authorName,
          content: text,
          createdAt: res.createdAt,
        },
      ]
      socialPosts.value = socialPosts.value.map((p) =>
        p.id === post.id ? { ...p, commentsCount: p.commentsCount + 1 } : p
      )
      commentInputText.value = ''
      showToast('Commentaire publié', 'success')
    }
  } catch (err: any) {
    showToast(
      err?.message || 'Erreur lors de la publication du commentaire',
      'error',
    )
  }
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
  const isModalOpen =
    isComposeOpen.value || activeCommentsPost.value !== null
  isBottomNavHidden.value = isModalOpen
})

// Initial load from backend
void loadCommunity()
