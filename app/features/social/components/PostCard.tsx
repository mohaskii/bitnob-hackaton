import { ShieldCheck, TrendingDown, TrendingUp } from 'lucide-preact'
import { SocialPost } from '../../../state.ts'
import { PostTradeSnippet } from './PostTradeSnippet.tsx'
import { PostEngagementBar } from './PostEngagementBar.tsx'

interface PostCardProps {
  post: SocialPost
}

export const PostCard = ({ post }: PostCardProps) => {
  const isBullish = post.sentiment === 'bullish'

  return (
    <article class='bg-base-100 rounded-2xl p-4 flex flex-col gap-3 border border-base-200/60 shadow-2xs select-none'>
      {/* Author & Action Header */}
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
                <ShieldCheck
                  size={13}
                  class='text-primary flex-shrink-0'
                />
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
              isBullish
                ? 'bg-success/15 text-success'
                : 'bg-error/15 text-error'
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

      {/* Post Content Text */}
      <p class='text-xs sm:text-sm text-base-content/85 leading-relaxed'>
        {post.content}
      </p>

      {/* Embedded Trade Snippet */}
      <PostTradeSnippet post={post} />

      {/* Engagement Tray */}
      <PostEngagementBar post={post} />
    </article>
  )
}
