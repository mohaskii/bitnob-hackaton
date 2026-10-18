import { Heart, MessageCircle, Share2 } from 'lucide-preact'
import { SocialPost } from '../../../state.ts'
import { openCommentsModal, toggleLikePost } from '../social-state.ts'

type PostEngagementBarProps = {
  post: SocialPost
}

export const PostEngagementBar = ({ post }: PostEngagementBarProps) => {
  return (
    <div class='flex items-center justify-between pt-2 text-base-content/60 text-xs'>
      <button
        type='button'
        onClick={() => toggleLikePost(post.id)}
        class={`flex items-center gap-1.5 cursor-pointer active:scale-110 transition-all ${
          post.isLiked ? 'text-error font-bold' : 'hover:text-base-content'
        }`}
      >
        <Heart
          size={15}
          class={post.isLiked ? 'fill-current text-error' : ''}
        />
        <span>{post.likesCount}</span>
      </button>

      <button
        type='button'
        onClick={() => openCommentsModal(post)}
        class='flex items-center gap-1.5 hover:text-base-content cursor-pointer active:scale-105 transition-all'
      >
        <MessageCircle size={15} />
        <span>{post.commentsCount}</span>
      </button>

      <button
        type='button'
        class='hover:text-base-content cursor-pointer transition-colors'
        aria-label='Partager le post'
      >
        <Share2 size={15} />
      </button>
    </div>
  )
}
