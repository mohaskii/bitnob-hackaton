import { useEffect } from 'preact/hooks'
import { ArrowLeft, Heart, MessageCircle } from 'lucide-preact'
import { navigateUrl } from '../router.tsx'
import { Pill, PrimaryButton, SectionTitle } from '../components/ui.tsx'
import { relativeTime } from '../lib/format.ts'
import {
  draft,
  likePost,
  loadCommunity,
  posting,
  posts,
  profiles,
  publishDraft,
  setDraft,
  toggleFollow,
} from '../features/community/community-state.ts'
import { openStock } from '../features/market/market-state.ts'

const startCommunity = () => void loadCommunity()

const ExampleBanner = () => (
  <p class='text-[12px] font-semibold bg-warning/20 rounded-2xl px-3.5 py-3'>
    Les profils marqués « exemple » et leurs performances sont illustratifs et
    simulés. Suivre un profil ne copie aucun ordre : c’est pour apprendre en
    observant.
  </p>
)

const ProfilesRow = () => (
  <section class='flex flex-col gap-3'>
    <SectionTitle title='Stratégies à observer' />
    <div class='flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1'>
      {profiles.value.map((profile) => (
        <div
          key={profile.id}
          class='min-w-[210px] bg-base-100 rounded-3xl p-4 flex flex-col gap-3'
        >
          <div class='flex items-center gap-2.5'>
            <img
              src={profile.avatarUrl}
              alt=''
              class='w-11 h-11 rounded-2xl object-cover'
            />
            <div class='min-w-0'>
              <p class='text-[14px] font-extrabold truncate'>{profile.name}</p>
              <p class='text-[11.5px] text-base-content/50 truncate'>
                {profile.badge}
              </p>
            </div>
          </div>
          <div class='flex justify-between text-[12px]'>
            <div>
              <p class='text-base-content/50 font-semibold'>
                {profile.timeframe}
              </p>
              <p class='font-black text-success'>+{profile.returnPercent} %</p>
            </div>
            <div class='text-right'>
              <p class='text-base-content/50 font-semibold'>Risque</p>
              <p class='font-black'>{profile.riskLevel}</p>
            </div>
          </div>
          <Pill tone='warning'>Exemple</Pill>
          <button
            type='button'
            onClick={() => void toggleFollow(profile)}
            class={`h-10 rounded-xl text-[12.5px] font-bold cursor-pointer ${
              profile.isFollowed
                ? 'bg-base-200'
                : 'bg-neutral text-neutral-content'
            }`}
          >
            {profile.isFollowed ? 'Suivi (observation)' : 'Observer'}
          </button>
        </div>
      ))}
    </div>
  </section>
)

const Composer = () => (
  <div class='bg-base-100 rounded-3xl p-3 flex flex-col gap-2'>
    <textarea
      value={draft.value}
      onInput={(e) => setDraft((e.target as HTMLTextAreaElement).value)}
      maxLength={500}
      rows={2}
      placeholder='Une question sur les frais, une SGI, un titre ?'
      class='w-full resize-none bg-transparent text-[13.5px] focus:outline-none p-1'
    />
    <PrimaryButton
      onClick={() => void publishDraft()}
      disabled={!draft.value.trim()}
      pending={posting.value}
    >
      Publier
    </PrimaryButton>
  </div>
)

const Feed = () => (
  <section class='flex flex-col gap-3'>
    <SectionTitle title='Discussions' />
    <Composer />
    {posts.value.map((post) => (
      <article
        key={post.id}
        class='bg-base-100 rounded-3xl p-4 flex flex-col gap-2.5'
      >
        <div class='flex items-center gap-2.5'>
          {post.avatarUrl
            ? (
              <img
                src={post.avatarUrl}
                alt=''
                class='w-9 h-9 rounded-xl object-cover'
              />
            )
            : (
              <span class='w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-[13px]'>
                {post.authorName.slice(0, 1).toUpperCase()}
              </span>
            )}
          <div class='min-w-0 flex-1'>
            <p class='text-[13.5px] font-bold truncate'>{post.authorName}</p>
            <p class='text-[11px] text-base-content/45'>
              {relativeTime(post.createdAt)}
            </p>
          </div>
          {post.isExample && <Pill tone='warning'>Exemple</Pill>}
        </div>
        <p class='text-[13.5px] leading-relaxed'>{post.content}</p>
        <div class='flex items-center gap-4 text-[12px] font-semibold text-base-content/50'>
          <button
            type='button'
            onClick={() => void likePost(post.id)}
            class='flex items-center gap-1 cursor-pointer'
          >
            <Heart size={14} /> {post.likesCount}
          </button>
          <span class='flex items-center gap-1'>
            <MessageCircle size={14} /> {post.commentsCount}
          </span>
          {post.symbol && (
            <button
              type='button'
              onClick={() => openStock(post.symbol!)}
              class='ml-auto px-2.5 py-1 rounded-full bg-base-200 text-base-content font-bold cursor-pointer'
            >
              ${post.symbol}
            </button>
          )}
        </div>
      </article>
    ))}
  </section>
)

/** CommunityScreen: learn by observing, clearly labelled as examples. */
export const CommunityScreen = () => {
  useEffect(startCommunity, [])
  return (
    <div class='flex-1 flex flex-col w-full pt-[calc(env(safe-area-inset-top,0px)+1rem)] px-4 pb-6 gap-5'>
      <button
        type='button'
        onClick={() => navigateUrl('/')}
        class='self-start flex items-center gap-1 text-[13px] font-bold text-base-content/60 cursor-pointer'
      >
        <ArrowLeft size={16} /> Accueil
      </button>
      <h1 class='text-[26px] font-black tracking-tight -mt-2'>Communauté</h1>
      <ExampleBanner />
      <ProfilesRow />
      <Feed />
    </div>
  )
}
