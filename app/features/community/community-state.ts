import { signal } from '@preact/signals'
import { api, errorMessage } from '../../lib/api.ts'
import { showToast } from '../../state.ts'

export type ExampleProfile = {
  id: string
  name: string
  handle: string
  avatarUrl: string
  returnPercent: number
  timeframe: string
  winRate: number
  riskLevel: string
  badge: string | null
  isFollowed: boolean
}

export type CommunityPost = {
  id: string
  authorName: string
  authorHandle: string
  avatarUrl: string
  isExample: boolean
  content: string
  symbol: string | null
  sentiment: string | null
  likesCount: number
  commentsCount: number
  createdAt: number
}

export const profiles = signal<ExampleProfile[]>([])
export const posts = signal<CommunityPost[]>([])
export const draft = signal('')
export const posting = signal(false)

export const loadCommunity = async () => {
  try {
    const result = await api.get<
      { traders: ExampleProfile[]; posts: CommunityPost[] }
    >(
      '/community',
    )
    profiles.value = result.traders
    posts.value = result.posts
  } catch (error) {
    showToast(errorMessage(error), 'error')
  }
}

export const toggleFollow = async (profile: ExampleProfile) => {
  const follow = !profile.isFollowed
  profiles.value = profiles.value.map((p) =>
    p.id === profile.id ? { ...p, isFollowed: follow } : p
  )
  try {
    await api.post('/community/follow', { traderId: profile.id, follow })
  } catch (error) {
    showToast(errorMessage(error), 'error')
    void loadCommunity()
  }
}

export const likePost = async (postId: string) => {
  posts.value = posts.value.map((p) =>
    p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p
  )
  await api.post('/community/posts/like', { postId }).catch(() => {})
}

export const setDraft = (value: string) => {
  draft.value = value
}

export const publishDraft = async () => {
  if (!draft.value.trim()) return
  posting.value = true
  try {
    await api.post('/community/posts', { content: draft.value })
    draft.value = ''
    await loadCommunity()
  } catch (error) {
    showToast(errorMessage(error), 'error')
  } finally {
    posting.value = false
  }
}
