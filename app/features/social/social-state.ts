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
import { navigate } from '../../router.tsx'
import { setAuthMode, user } from '../session/session-state.ts'

/* -------------------------------------------------------------------------- */
/* Signals (Rule 1: A signal for every piece of mutable data)                 */
/* -------------------------------------------------------------------------- */

export const trendingAssets = signal<TrendingAsset[]>([])
export const activeFilterSymbol = signal<string | null>(null)
export const isAccountRequiredModalOpen = signal(false)

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
        isLiked?: boolean
        commentsCount: number
        createdAt: number
      }>
      trending?: TrendingAsset[]
    }>('/community')

    if (data?.posts) {
      socialPosts.value = data.posts.map((p) => ({
        id: String(p.id || p.postId),
        authorName: p.authorName,
        authorHandle: p.authorHandle,
        avatarUrl: p.avatarUrl || '',
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
        isLiked: Boolean(p.isLiked),
        commentsCount: p.commentsCount || 0,
        copiersCount: 0,
      }))
    }

    if (data?.trending) {
      trendingAssets.value = data.trending
    }
  } catch (err) {
    console.warn('[Community] Failed to load from backend:', err)
  }
}

export const setActiveFilterSymbol = (symbol: string | null) => {
  activeFilterSymbol.value = symbol
}

export const openAccountRequiredModal = () => {
  isAccountRequiredModalOpen.value = true
}

export const closeAccountRequiredModal = () => {
  isAccountRequiredModalOpen.value = false
}

export const redirectToRegisterFromSocial = () => {
  closeAccountRequiredModal()
  setAuthMode('register')
  navigate({ href: '/' })
}

export const redirectToLoginFromSocial = () => {
  closeAccountRequiredModal()
  setAuthMode('login')
  navigate({ href: '/' })
}

export const toggleLikePost = async (postId: string) => {
  const currentUser = user.value
  if (!currentUser || currentUser.isGuest !== 0) {
    openAccountRequiredModal()
    return
  }

  // Optimistic UI update
  toggleLikeSocialPost(postId)

  try {
    const res = await api.post<{
      postId: string
      isLiked: boolean
      likesCount: number
    }>('/community/posts/like', { postId })

    if (res) {
      toggleLikeSocialPost(postId, res.isLiked, res.likesCount)
    }
  } catch {
    // Revert optimistic update
    toggleLikeSocialPost(postId)
    showToast('Action impossible', 'error')
  }
}

export const openCompose = () => {
  const currentUser = user.value
  if (!currentUser || currentUser.isGuest !== 0) {
    openAccountRequiredModal()
    return
  }
  isComposeOpen.value = true
  isBottomNavHidden.value = true
  navigate({ href: '/compose' })
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
  const currentUser = user.value
  if (!currentUser || currentUser.isGuest !== 0) {
    openAccountRequiredModal()
    return
  }

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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur lors de la publication'
    showToast(msg, 'error')
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
