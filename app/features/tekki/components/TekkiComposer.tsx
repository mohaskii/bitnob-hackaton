import { Loader2, Mic, SendHorizontal, Trash2 } from 'lucide-preact'
import {
  ask,
  asking,
  cancelListening,
  composerAction,
  draft,
  isEmpty,
  pressAction,
  pressMic,
  recordingClock,
  recordingLocked,
  releaseMic,
  sendDraft,
  setDraft,
  suggestions,
  voiceAvailable,
  voicePhase,
} from '../tekki-state.ts'

const SuggestionChips = () =>
  isEmpty.value || asking.value || voicePhase.value !== 'idle'
    ? null
    : (
      <div class='flex gap-1.5 overflow-x-auto no-scrollbar -mx-3 px-3'>
        {suggestions.value.map((s) => (
          <button
            key={s}
            type='button'
            onClick={() => void ask(s)}
            class='flex-shrink-0 max-w-[250px] truncate h-8 px-3 rounded-full bg-base-200 text-[11.5px] font-semibold cursor-pointer active:scale-95 transition-transform'
          >
            {s}
          </button>
        ))}
      </div>
    )

const RecordingStrip = () => (
  <div class='flex-1 h-12 flex items-center gap-2.5 pl-1 pr-3 rounded-full bg-base-200'>
    {recordingLocked.value
      ? (
        <button
          type='button'
          onClick={cancelListening}
          aria-label='Annuler l’enregistrement'
          class='w-10 h-10 rounded-full flex items-center justify-center text-error cursor-pointer'
        >
          <Trash2 size={18} />
        </button>
      )
      : <span class='w-3' />}
    <span class='w-2.5 h-2.5 rounded-full bg-error animate-rec-pulse' />
    <span class='text-[14px] font-bold tabular-nums'>
      {recordingClock.value}
    </span>
    <span class='flex-1 text-right text-[11.5px] font-semibold text-base-content/45 truncate'>
      {recordingLocked.value ? 'Enregistrement…' : 'Relâche pour envoyer'}
    </span>
  </div>
)

const ProcessingStrip = () => (
  <div class='flex-1 h-12 flex items-center gap-2 px-4 rounded-full bg-base-200 text-[12.5px] font-semibold text-base-content/55'>
    <Loader2 size={15} class='animate-spin' /> Transcription de ton message…
  </div>
)

const TextField = () => (
  <textarea
    value={draft.value}
    onInput={(e) => setDraft((e.target as HTMLTextAreaElement).value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendDraft()
      }
    }}
    rows={1}
    placeholder='Écris à Tekki…'
    class='flex-1 min-h-12 max-h-28 px-4 py-3 rounded-[1.5rem] bg-base-200 text-[14px] leading-snug resize-none focus:outline-none focus:ring-2 focus:ring-primary/70'
  />
)

const InputArea = () =>
  voicePhase.value === 'listening'
    ? <RecordingStrip />
    : voicePhase.value === 'processing'
    ? <ProcessingStrip />
    : <TextField />

/** One round button, like WhatsApp: mic when empty, send when there's text. */
const ActionButton = () => {
  const action = composerAction.value
  return (
    <button
      type='button'
      onPointerDown={pressMic}
      onPointerUp={releaseMic}
      onPointerCancel={cancelListening}
      onClick={pressAction}
      onContextMenu={(e) => e.preventDefault()}
      disabled={asking.value || voicePhase.value === 'processing' ||
        (action === 'mic' && !voiceAvailable.value)}
      aria-label={action === 'send' ? 'Envoyer' : 'Maintenir pour parler'}
      class={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer select-none touch-none transition-all duration-150 disabled:opacity-35 ${
        action === 'recording'
          ? 'bg-error text-error-content scale-[1.18] shadow-[0_0_0_8px_rgba(229,57,53,0.15)]'
          : action === 'send'
          ? 'bg-primary text-primary-content'
          : 'bg-neutral text-neutral-content'
      }`}
    >
      {action === 'send' ? <SendHorizontal size={19} /> : <Mic size={20} />}
    </button>
  )
}

export const TekkiComposer = () => (
  <div class='bg-base-100 border-t border-base-300/70 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-2'>
    <SuggestionChips />
    <div class='flex items-end gap-2'>
      <InputArea />
      <ActionButton />
    </div>
    <p class='text-[10px] text-center text-base-content/40'>
      Tekki explique les données, il ne donne pas de conseil d’investissement.
    </p>
  </div>
)
