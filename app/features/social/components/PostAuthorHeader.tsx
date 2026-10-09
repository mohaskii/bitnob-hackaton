import { ShieldCheck, TrendingDown, TrendingUp } from 'lucide-preact'
import { SocialPost } from '../../../state.ts'

type PostAuthorHeaderProps = {
  post: SocialPost
}

/**
 * PostAuthorHeader:
 * Displays author avatar, verified badge, handle, timestamp, and sentiment pill.
 */
export const PostAuthorHeader = ({ post }: PostAuthorHeaderProps) => {
  const isBullish = post.sentiment === 'bullish'

  return (
    <div class='flex items-start justify-between gap-2'>
      <div class='flex items-center gap-2.5 min-w-0'>
        <img
          src={post.avatarUrl}
          alt={post.authorName}
          class='w-10 h-10 rounded-full object-cover ring-1 ring-base-200 flex-shrink-0'
        />
        <div class='min-w-0'>
          <div class='flex items-center gap-1.5'>
            <span class='font-bold text-sm text-base-content truncate'>
              {post.authorName}
            </span>
            {post.verified && (
              <ShieldCheck size={13} class='text-primary flex-shrink-0' />
            )}
          </div>
          <span class='text-xs text-base-content/50 block'>
            @{post.authorHandle} • {post.timeAgo}
          </span>
        </div>
      </div>

      {post.sentiment && (
        <span
          class={`badge badge-sm border-0 font-bold text-[10px] px-2.5 py-1 flex items-center gap-1 ${
            isBullish ? 'bg-success/15 text-success' : 'bg-error/15 text-error'
          }`}
        >
          {isBullish
            ? (
              <>
                <TrendingUp size={11} strokeWidth={2.5} />
                <span>Haussier</span>
              </>
            )
            : (
              <>
                <TrendingDown size={11} strokeWidth={2.5} />
                <span>Baissier</span>
              </>
            )}
        </span>
      )}
    </div>
  )
}
