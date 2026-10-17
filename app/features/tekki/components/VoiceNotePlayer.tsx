import { Loader2, Pause, Play } from 'lucide-preact'
import {
  buffering,
  cycleRate,
  formatDuration,
  noteViews,
  paused,
  playingId,
  position,
  progress,
  rate,
  seekAt,
  togglePlay,
} from '../voice-note-state.ts'

/** `dark`: inside the user's black bubble. `light`: inside Tekki's bubble. */
export type VoiceTone = 'dark' | 'light'

const TONES = {
  dark: {
    button: 'bg-white text-neutral',
    played: 'bg-primary',
    idle: 'bg-white/30',
    meta: 'text-white/60',
    pill: 'bg-white/15 text-white',
  },
  light: {
    button: 'bg-primary text-primary-content',
    played: 'bg-neutral',
    idle: 'bg-base-content/20',
    meta: 'text-base-content/50',
    pill: 'bg-base-200 text-base-content',
  },
}

const VoicePlayButton = ({ id, tone }: { id: string; tone: VoiceTone }) => {
  const view = noteViews.value[id]
  const active = playingId.value === id && !paused.value
  const waiting = !view?.ready || (active && buffering.value)
  return (
    <button
      type='button'
      onClick={() => togglePlay(id)}
      disabled={!view?.ready}
      aria-label={active ? 'Pause' : 'Écouter'}
      class={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform active:scale-90 ${
        TONES[tone].button
      }`}
    >
      {waiting
        ? <Loader2 size={17} class='animate-spin' />
        : active
        ? <Pause size={17} fill='currentColor' />
        : <Play size={17} fill='currentColor' class='ml-0.5' />}
    </button>
  )
}

const VoiceWaveform = ({ id, tone }: { id: string; tone: VoiceTone }) => {
  const bars = noteViews.value[id]?.bars ?? []
  const played = playingId.value === id ? progress.value : 0
  return (
    <button
      type='button'
      onClick={(e) => seekAt(id, e)}
      aria-label='Avancer dans le message vocal'
      class='h-7 flex items-center gap-[2px] cursor-pointer'
    >
      {bars.map((height, i) => (
        <span
          key={i}
          class={`w-[3px] rounded-full transition-colors ${
            i / bars.length < played ? TONES[tone].played : TONES[tone].idle
          }`}
          style={{ height: `${Math.round(5 + height * 21)}px` }}
        />
      ))}
    </button>
  )
}

const VoiceNoteMeta = ({ id, tone }: { id: string; tone: VoiceTone }) => {
  const view = noteViews.value[id]
  const isCurrent = playingId.value === id
  return (
    <div
      class={`flex items-center justify-between text-[10.5px] font-semibold tabular-nums ${
        TONES[tone].meta
      }`}
    >
      <span>
        {formatDuration(isCurrent ? position.value : view?.duration ?? 0)}
        {view && !view.complete && !view.failed && ' · la suite arrive…'}
        {view?.failed && ' · audio incomplet'}
      </span>
      {isCurrent && (
        <button
          type='button'
          onClick={cycleRate}
          class={`px-1.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
            TONES[tone].pill
          }`}
        >
          {rate.value}×
        </button>
      )}
    </div>
  )
}

/** WhatsApp-style voice note: play/pause, tappable waveform, time, speed. */
export const VoiceNotePlayer = (
  { id, tone }: { id: string; tone: VoiceTone },
) => (
  <div class='flex items-center gap-2.5 w-[232px] max-w-full'>
    <VoicePlayButton id={id} tone={tone} />
    <div class='flex-1 min-w-0 flex flex-col gap-0.5'>
      <VoiceWaveform id={id} tone={tone} />
      <VoiceNoteMeta id={id} tone={tone} />
    </div>
  </div>
)
