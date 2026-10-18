import { GraduationCap, Sparkles, SquarePen, X } from 'lucide-preact'
import {
  asking,
  closeTekki,
  context,
  cycleLevel,
  isEmpty,
  levelLabel,
  newConversation,
  replyLanguage,
  setLanguage,
  statusLine,
  voicePhase,
} from '../tekki-state.ts'

export const TekkiAvatar = ({ size = 40 }: { size?: number }) => (
  <span
    class='relative rounded-full bg-primary text-primary-content flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_-4px_rgba(247,224,28,0.9)]'
    style={{ width: `${size}px`, height: `${size}px` }}
  >
    <Sparkles size={Math.round(size * 0.45)} />
    <span class='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-base-100' />
  </span>
)

const StatusLine = () => (
  <p
    class={`text-[11.5px] font-medium truncate ${
      asking.value || voicePhase.value !== 'idle'
        ? 'text-success'
        : 'text-base-content/50'
    }`}
  >
    {statusLine.value}
  </p>
)

const LanguageToggle = () => (
  <div class='flex items-center p-0.5 rounded-full bg-base-200'>
    {(['fr', 'wo'] as const).map((lang) => (
      <button
        key={lang}
        type='button'
        onClick={() => setLanguage(lang)}
        class={`h-7 px-2.5 rounded-full text-[11px] font-extrabold cursor-pointer transition-colors ${
          replyLanguage.value === lang
            ? 'bg-neutral text-neutral-content'
            : 'text-base-content/50'
        }`}
      >
        {lang === 'fr' ? 'FR' : 'WO'}
      </button>
    ))}
  </div>
)

const CloseButton = () => (
  <button
    type='button'
    onClick={closeTekki}
    aria-label='Fermer'
    class='w-9 h-9 rounded-full bg-base-200 flex items-center justify-center cursor-pointer active:scale-95 transition-transform'
  >
    <X size={18} />
  </button>
)

const ContextChip = () =>
  context.value.label
    ? (
      <span class='min-w-0 truncate px-2.5 h-7 inline-flex items-center rounded-full bg-primary/25 text-[11px] font-bold'>
        {context.value.label}
      </span>
    )
    : (
      <span class='text-[11px] font-semibold text-base-content/45'>
        Marchés BRVM · TekkiTrade
      </span>
    )

const LevelChip = () => (
  <button
    type='button'
    onClick={cycleLevel}
    class='flex-shrink-0 h-7 px-2.5 rounded-full bg-base-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer'
  >
    <GraduationCap size={13} /> {levelLabel.value}
  </button>
)

const NewConversationButton = () =>
  isEmpty.value ? null : (
    <button
      type='button'
      onClick={newConversation}
      aria-label='Nouvelle conversation'
      class='flex-shrink-0 w-7 h-7 rounded-full bg-base-200 flex items-center justify-center cursor-pointer'
    >
      <SquarePen size={13} />
    </button>
  )

/** Name, live status, language, then the context of the conversation. */
export const TekkiHeader = () => (
  <header class='bg-base-100 px-4 pt-3 pb-2.5 flex flex-col gap-2.5 border-b border-base-300/70'>
    <div class='w-10 h-1 rounded-full bg-base-content/15 mx-auto -mt-1' />
    <div class='flex items-center gap-3'>
      <TekkiAvatar />
      <div class='flex-1 min-w-0'>
        <p class='text-[16px] font-black leading-tight'>Tekki</p>
        <StatusLine />
      </div>
      <LanguageToggle />
      <CloseButton />
    </div>
    <div class='flex items-center gap-2'>
      <ContextChip />
      <span class='flex-1' />
      <LevelChip />
      <NewConversationButton />
    </div>
  </header>
)
