import { computed, signal } from '@preact/signals'
import { analyzeAudio } from './audio.ts'

/**
 * Voice notes engine, WhatsApp style: one player for the whole conversation.
 * A note is made of clips (a Tekki answer arrives sentence by sentence) and
 * can start playing before its last clip exists.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type VoiceClip = { url: string; duration: number; peaks: number[] }
export type VoiceNote = {
  clips: VoiceClip[]
  /** All clips received. */
  complete: boolean
  failed: boolean
  /** Start playing as soon as the first clip arrives. */
  autoplay: boolean
}
export type NoteView = {
  duration: number
  bars: number[]
  ready: boolean
  complete: boolean
  failed: boolean
}

const BARS = 34
const RATES = [1, 1.5, 2]

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export const voiceNotes = signal<Record<string, VoiceNote>>({})
export const playingId = signal<string | null>(null)
export const paused = signal(true)
/** The next sentence is still being synthesized. */
export const buffering = signal(false)
/** Seconds since the start of the playing note. */
export const position = signal(0)
export const rate = signal(1)

/* -------------------------------------------------------------------------- */
/* Pure helpers                                                               */
/* -------------------------------------------------------------------------- */

const totalDuration = (note: VoiceNote) =>
  note.clips.reduce((sum, clip) => sum + clip.duration, 0)

/** Waveform of the whole note, each clip weighted by its duration. */
const barsOf = (note: VoiceNote) => {
  const total = totalDuration(note)
  if (!total) return Array.from({ length: BARS }, () => 0.15)
  return Array.from({ length: BARS }, (_, i) => {
    let t = ((i + 0.5) / BARS) * total
    for (const clip of note.clips) {
      if (t <= clip.duration) {
        const index = Math.floor((t / clip.duration) * clip.peaks.length)
        return Math.max(
          0.12,
          clip.peaks[Math.min(index, clip.peaks.length - 1)],
        )
      }
      t -= clip.duration
    }
    return 0.12
  })
}

export const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/* -------------------------------------------------------------------------- */
/* Computeds                                                                  */
/* -------------------------------------------------------------------------- */

export const noteViews = computed<Record<string, NoteView>>(() =>
  Object.fromEntries(
    Object.entries(voiceNotes.value).map(([id, note]) => [id, {
      duration: totalDuration(note),
      bars: barsOf(note),
      ready: note.clips.length > 0,
      complete: note.complete,
      failed: note.failed,
    }]),
  )
)

/** Share of the playing note already heard (0–1). */
export const progress = computed(() => {
  const id = playingId.value
  const duration = id ? noteViews.value[id]?.duration : 0
  return duration ? Math.min(1, position.value / duration) : 0
})

/* -------------------------------------------------------------------------- */
/* Player                                                                     */
/* -------------------------------------------------------------------------- */

let audio: HTMLAudioElement | null = null
let clipIndex = 0

const clipStart = (note: VoiceNote, index: number) =>
  note.clips.slice(0, index).reduce((sum, clip) => sum + clip.duration, 0)

const finish = () => {
  playingId.value = null
  paused.value = true
  buffering.value = false
  position.value = 0
}

const onClipEnded = () => {
  const id = playingId.value
  const note = id ? voiceNotes.value[id] : undefined
  if (!note) return finish()
  if (note.clips[clipIndex + 1]) startClip(clipIndex + 1)
  else if (!note.complete && !note.failed) buffering.value = true
  else finish()
}

const player = () => {
  if (audio) return audio
  audio = new Audio()
  audio.ontimeupdate = () => {
    const note = playingId.value ? voiceNotes.value[playingId.value] : null
    if (note) position.value = clipStart(note, clipIndex) + audio!.currentTime
  }
  audio.onended = onClipEnded
  return audio
}

const startClip = (index: number, offset = 0) => {
  const note = playingId.value ? voiceNotes.value[playingId.value] : null
  const clip = note?.clips[index]
  if (!clip) return
  clipIndex = index
  buffering.value = false
  const el = player()
  el.src = clip.url
  el.playbackRate = rate.value
  if (offset) {
    el.addEventListener('loadedmetadata', () => (el.currentTime = offset), {
      once: true,
    })
  }
  if (!paused.value) void el.play().catch(() => (paused.value = true))
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export const playNote = (id: string, from = 0) => {
  const note = voiceNotes.value[id]
  if (!note?.clips.length) return
  audio?.pause()
  playingId.value = id
  paused.value = false
  position.value = from
  let start = 0
  for (const [index, clip] of note.clips.entries()) {
    if (from < start + clip.duration || index === note.clips.length - 1) {
      return startClip(index, Math.max(0, from - start))
    }
    start += clip.duration
  }
}

export const togglePlay = (id: string) => {
  if (playingId.value !== id) return playNote(id)
  if (paused.value) {
    paused.value = false
    if (!buffering.value) {
      void player().play().catch(() => (paused.value = true))
    }
  } else {
    paused.value = true
    audio?.pause()
  }
}

export const seekNote = (id: string, ratio: number) =>
  playNote(id, ratio * (noteViews.value[id]?.duration ?? 0))

/** Tap on the waveform: jump to that point, like WhatsApp. */
export const seekAt = (id: string, event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  seekNote(
    id,
    Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
  )
}

export const cycleRate = () => {
  rate.value = RATES[(RATES.indexOf(rate.value) + 1) % RATES.length]
  if (audio) audio.playbackRate = rate.value
}

export const stopVoice = () => {
  audio?.pause()
  finish()
}

export const createNote = (id: string, autoplay: boolean) => {
  voiceNotes.value = {
    ...voiceNotes.value,
    [id]: { clips: [], complete: false, failed: false, autoplay },
  }
}

const updateNote = (id: string, patch: Partial<VoiceNote>) => {
  const note = voiceNotes.value[id]
  if (note) {
    voiceNotes.value = { ...voiceNotes.value, [id]: { ...note, ...patch } }
  }
}

/** Adds a clip; plays it if the note was waiting for it. */
export const appendClip = async (
  id: string,
  bytes: Uint8Array,
  type: string,
) => {
  const { duration, peaks } = await analyzeAudio(bytes.slice().buffer)
  const note = voiceNotes.value[id]
  if (!note) return // conversation reset meanwhile
  const url = URL.createObjectURL(new Blob([bytes.slice()], { type }))
  updateNote(id, { clips: [...note.clips, { url, duration, peaks }] })
  const index = note.clips.length
  if (index === 0 && note.autoplay && !playingId.value) playNote(id)
  else if (
    playingId.value === id && buffering.value && index === clipIndex + 1
  ) {
    startClip(index)
  }
}

export const completeNote = (id: string) => {
  updateNote(id, { complete: true })
  if (playingId.value === id && buffering.value) finish()
}

export const failNote = (id: string) => {
  updateNote(id, { failed: true })
  if (playingId.value === id && buffering.value) finish()
}

/** No note may start by itself any more (a newer question was asked). */
export const holdAutoplay = () => {
  voiceNotes.value = Object.fromEntries(
    Object.entries(voiceNotes.value).map(([id, note]) => [id, {
      ...note,
      autoplay: false,
    }]),
  )
}

/** Frees every recorded or synthesized clip (new conversation). */
export const releaseNotes = () => {
  stopVoice()
  Object.values(voiceNotes.value).forEach((note) =>
    note.clips.forEach((clip) => URL.revokeObjectURL(clip.url))
  )
  voiceNotes.value = {}
}
