import { SocialPost } from '../../../state.ts'
import { PostAuthorHeader } from './PostAuthorHeader.tsx'
import { PostTradeSnippet } from './PostTradeSnippet.tsx'
import { PostEngagementBar } from './PostEngagementBar.tsx'

type PostCardProps = {
  post: SocialPost
}

/**
 * PostCard:
 * Thin orchestrator for community feed post (Rule 5: Decomposition Discipline).
 * Pure flat design: zero borders, zero shadows, contrast via bg-base-100.
 */
export const PostCard = ({ post }: PostCardProps) => {
  return (
    <article class='bg-base-100 rounded-2xl p-4 flex flex-col gap-3 select-none'>

      {/* 1. Author and sentiment header */}
      <PostAuthorHeader post={post} />

      {/* 2. Post body text */}
      <p class='text-xs sm:text-sm text-base-content/85 leading-relaxed'>
        {post.content}
      </p>

      {/* 3. Embedded trade snippet */}
      <PostTradeSnippet post={post} />

      {/* 4. Interactive engagement tray */}
      <PostEngagementBar post={post} />
    </article>
  )
}
