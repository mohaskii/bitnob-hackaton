import { ChevronDown, ShieldCheck, Volume2 } from 'lucide-preact'
import {
  detailsCount,
  detailsOpen,
  LANGUAGE_LABELS,
  modeLabel,
  speakAnswer,
  type TekkiMessage,
  toggleDetails,
  type UserMessage,
  voiceAvailable,
} from '../tekki-state.ts'
import type { TekkiAnswer } from '../tekki-api.ts'
import { noteViews } from '../voice-note-state.ts'
import { TekkiAnswerDetails } from './TekkiAnswerDetails.tsx'
import { VoiceNotePlayer } from './VoiceNotePlayer.tsx'

/* -------------------------------------------------------------------------- */
/* User                                                                       */
/* -------------------------------------------------------------------------- */

const VoiceTranscript = ({ message }: { message: UserMessage }) =>
  message.transcribing
    ? <p class='text-[11.5px] text-white/55 italic'>Transcription…</p>
    : message.text
    ? (
      <p class='text-[12.5px] leading-snug text-white/85'>
        {message.language && message.language !== 'unknown' && (
          <span class='text-[9.5px] font-black uppercase tracking-wide bg-white/15 rounded-md px-1.5 py-0.5 mr-1.5'>
            {LANGUAGE_LABELS[message.language]}
          </span>
        )}
        {message.text}
      </p>
    )
    : null

export const UserBubble = ({ message }: { message: UserMessage }) => (
  <div class='flex justify-end animate-bubble-in'>
    <div class='max-w-[86%] bg-neutral text-neutral-content rounded-[1.35rem] rounded-br-md px-3.5 py-2.5 flex flex-col gap-2 shadow-sm'>
      {message.voice && <VoiceNotePlayer id={message.id} tone='dark' />}
      {message.voice
        ? <VoiceTranscript message={message} />
        : <p class='text-[14px] leading-snug'>{message.text}</p>}
    </div>
  </div>
)

/* -------------------------------------------------------------------------- */
/* Tekki                                                                      */
/* -------------------------------------------------------------------------- */

const ListenButton = ({ id }: { id: string }) =>
  voiceAvailable.value
    ? (
      <button
        type='button'
        onClick={() => void speakAnswer(id)}
        class='self-start h-8 pl-2 pr-3 rounded-full bg-primary/30 text-[11.5px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform'
      >
        <span class='w-5 h-5 rounded-full bg-primary flex items-center justify-center'>
          <Volume2 size={11} />
        </span>
        Écouter la réponse
      </button>
    )
    : null

const AnswerVoice = ({ id }: { id: string }) =>
  noteViews.value[id]
    ? <VoiceNotePlayer id={id} tone='light' />
    : <ListenButton id={id} />

const GuardrailNote = () => (
  <p class='text-[11px] font-semibold flex items-center gap-1.5 text-base-content/60 bg-base-200 rounded-xl px-2.5 py-1.5'>
    <ShieldCheck size={13} class='flex-shrink-0' />
    Tekki explique, il ne conseille pas : la réponse a été recadrée.
  </p>
)

const DetailsToggle = ({ id, answer }: { id: string; answer: TekkiAnswer }) =>
  detailsCount(answer) === 0 ? null : (
    <button
      type='button'
      onClick={() => toggleDetails(id)}
      class='flex-shrink-0 whitespace-nowrap flex items-center gap-1 text-[11px] font-bold text-base-content/60 cursor-pointer'
    >
      Données et sources
      <ChevronDown
        size={13}
        class={`transition-transform ${
          detailsOpen.value[id] ? 'rotate-180' : ''
        }`}
      />
    </button>
  )

const AnswerFooter = ({ id, answer }: { id: string; answer: TekkiAnswer }) => (
  <div class='flex items-center justify-between gap-3 pt-1 border-t border-base-200'>
    <span class='text-[10px] font-semibold text-base-content/40 truncate'>
      {modeLabel(answer)}
    </span>
    <DetailsToggle id={id} answer={answer} />
  </div>
)

const AnswerDetailsSlot = (
  { id, answer }: { id: string; answer: TekkiAnswer },
) => detailsOpen.value[id] ? <TekkiAnswerDetails answer={answer} /> : null

const AnswerBody = ({ id, answer }: { id: string; answer: TekkiAnswer }) => (
  <>
    <AnswerVoice id={id} />
    <p class='text-[14px] leading-relaxed whitespace-pre-line'>
      {answer.answer}
    </p>
    {answer.guardrailTriggered && <GuardrailNote />}
    <AnswerFooter id={id} answer={answer} />
    <AnswerDetailsSlot id={id} answer={answer} />
  </>
)

export const TekkiBubble = ({ message }: { message: TekkiMessage }) => (
  <div class='flex justify-start animate-bubble-in'>
    <div class='max-w-[90%] bg-base-100 rounded-[1.35rem] rounded-bl-md px-3.5 py-3 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'>
      {message.answer
        ? <AnswerBody id={message.id} answer={message.answer} />
        : (
          <p class='text-[13px] font-semibold text-error'>
            {message.error ?? 'Tekki n’a pas pu répondre.'}
          </p>
        )}
    </div>
  </div>
)

export const TypingBubble = () => (
  <div class='flex justify-start animate-bubble-in'>
    <div class='bg-base-100 rounded-[1.35rem] rounded-bl-md px-4 py-3.5 flex items-center gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          class='w-2 h-2 rounded-full bg-base-content/60 animate-typing'
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  </div>
)
