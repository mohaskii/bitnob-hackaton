import { X } from 'lucide-preact'
import {
  activeFilterSymbol,
  filteredPosts,
  setActiveFilterSymbol,
} from '../social-state.ts'
import { PostCard } from './PostCard.tsx'

export const CommunityFeed = () => {
  const posts = filteredPosts.value
  const activeSymbol = activeFilterSymbol.value

  return (
    <section class='flex flex-col gap-3 px-4'>
      {/* Section Header */}
      <div class='flex items-center justify-between'>
        <div class='flex items-center gap-2'>
          <h2 class='text-base sm:text-lg font-bold text-base-content tracking-tight'>
            Flux Communautaire
          </h2>
          {activeSymbol && (
            <button
              type='button'
              onClick={() => setActiveFilterSymbol(null)}
              class='badge badge-sm bg-primary/20 text-primary-content border-0 gap-1 cursor-pointer font-bold'
            >
              <span>Filtre: {activeSymbol}</span>
              <X size={12} />
            </button>
          )}
        </div>
        <span class='text-xs text-base-content/50 font-medium'>
          {posts.length} posts
        </span>
      </div>

      {/* Post Items */}
      <div class='flex flex-col gap-3.5'>
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </section>
  )
}
