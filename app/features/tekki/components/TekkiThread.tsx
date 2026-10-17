import { ArrowUpRight, Mic, X } from 'lucide-preact'
import {
  ask,
  asking,
  dismissError,
  error,
  isEmpty,
  messages,
  suggestions,
  voiceAvailable,
} from '../tekki-state.ts'
import { TekkiBubble, TypingBubble, UserBubble } from './TekkiBubbles.tsx'
import { TekkiAvatar } from './TekkiHeader.tsx'

const WelcomeSuggestions = () => (
  <div class='w-full flex flex-col gap-2'>
    {suggestions.value.map((s) => (
      <button
        key={s}
        type='button'
        onClick={() => void ask(s)}
        class='w-full flex items-center justify-between gap-3 text-left px-4 py-3 rounded-2xl bg-base-100 text-[13px] font-semibold cursor-pointer active:scale-[0.99] transition-transform shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
      >
        {s}
        <ArrowUpRight size={16} class='flex-shrink-0 text-base-content/40' />
      </button>
    ))}
  </div>
)

const VoiceHint = () =>
  voiceAvailable.value
    ? (
      <p class='flex items-center gap-1.5 text-[11.5px] font-semibold text-base-content/50'>
        <span class='w-6 h-6 rounded-full bg-neutral text-neutral-content flex items-center justify-center'>
          <Mic size={12} />
        </span>
        Maintiens le micro et parle en wolof ou en français
      </p>
    )
    : null

const WelcomeCard = () => (
  <div class='flex-1 flex flex-col items-center justify-center gap-4 px-2 py-6 text-center animate-bubble-in'>
    <TekkiAvatar size={64} />
    <div class='flex flex-col gap-1'>
      <p class='text-[19px] font-black'>Salut, moi c’est Tekki</p>
      <p class='text-[13px] text-base-content/55 leading-snug max-w-[290px]'>
        Je t’explique les actions, les profils et les frais à partir des vraies
        données. Je ne te dirai jamais quoi acheter.
      </p>
    </div>
    <VoiceHint />
    <WelcomeSuggestions />
  </div>
)

const MessageList = () => (
  <>
    {messages.value.map((m) =>
      m.role === 'user'
        ? <UserBubble key={m.id} message={m} />
        : <TekkiBubble key={m.id} message={m} />
    )}
  </>
)

const Typing = () => (asking.value ? <TypingBubble /> : null)

const ErrorBanner = () =>
  error.value
    ? (
      <div class='self-center max-w-[92%] flex items-center gap-2 bg-error/10 text-error rounded-full pl-3.5 pr-1.5 py-1.5 text-[12px] font-semibold animate-bubble-in'>
        <span>{error.value}</span>
        <button
          type='button'
          onClick={dismissError}
          aria-label='Fermer'
          class='w-6 h-6 rounded-full flex items-center justify-center cursor-pointer'
        >
          <X size={13} />
        </button>
      </div>
    )
    : null

/** Scrollable conversation, newest message at the bottom. */
export const TekkiThread = () => (
  <div class='flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pt-4 pb-2 flex flex-col gap-2.5'>
    {isEmpty.value ? <WelcomeCard /> : <MessageList />}
    <Typing />
    <ErrorBanner />
    <div id='tekki-thread-end' class='h-px flex-shrink-0' />
  </div>
)
