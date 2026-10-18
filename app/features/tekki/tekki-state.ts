import { computed, effect, signal } from '@preact/signals'
import { isBottomNavHidden } from '../../state.ts'
import {
  base64ToBytes,
  bytesToBase64,
  type Recorder,
  startRecording,
  toWav16k,
} from './audio.ts'
import {
  type TekkiAnswer,
  tekkiApi,
  type TekkiContext,
  type Transcript,
} from './tekki-api.ts'
import {
  appendClip,
  completeNote,
  createNote,
  failNote,
  holdAutoplay,
  releaseNotes,
  stopVoice,
  voiceNotes,
} from './voice-note-state.ts'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Level = 'beginner' | 'investor' | 'advanced'
export type VoicePhase = 'idle' | 'listening' | 'processing'

export type UserMessage = {
  id: string
  role: 'user'
  text: string
  /** Asked by voice: the recording is replayable (voice note `id`). */
  voice: boolean
  transcribing: boolean
  language?: Transcript['language']
}
export type TekkiMessage = {
  id: string
  role: 'tekki'
  answer: TekkiAnswer | null
  error: string | null
}
export type ChatMessage = UserMessage | TekkiMessage

export const LEVELS: { id: Level; label: string }[] = [
  { id: 'beginner', label: 'Débutant' },
  { id: 'investor', label: 'Investisseur' },
  { id: 'advanced', label: 'Avancé' },
]

export const LANGUAGE_LABELS: Record<string, string> = {
  fr: 'Français',
  wo: 'Wolof',
  mixed: 'Wolof + français',
  unknown: 'Langue incertaine',
}

const MAX_RECORDING_MS = 60_000

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export const isOpen = signal(false)
export const context = signal<TekkiContext>({ page: 'general' })
export const level = signal<Level>('beginner')
export const draft = signal('')
export const asking = signal(false)
export const messages = signal<ChatMessage[]>([])
export const error = signal<string | null>(null)
/** Facts, sources and points unfolded under an answer, by message id. */
export const detailsOpen = signal<Record<string, boolean>>({})

export const voicePhase = signal<VoicePhase>('idle')
export const recordingSeconds = signal(0)
/** Quick tap on the mic: recording continues hands-free (WhatsApp "lock"). */
export const recordingLocked = signal(false)
/** Language of the conversation, remembered for the session. */
export const conversationLanguage = signal<'fr' | 'wo' | 'mixed'>('fr')

export const voiceAvailable = signal(false)
export const aiAvailable = signal(false)
/** Languages read by the local Oolel model, sentence by sentence. */
const localVoiceLanguages = signal<string[]>([])

/* -------------------------------------------------------------------------- */
/* Computeds                                                                  */
/* -------------------------------------------------------------------------- */

const lastAnswer = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    const message = messages.value[i]
    if (message.role === 'tekki' && message.answer) return message.answer
  }
  return null
})

const askedQuestions = computed(() =>
  new Set(
    messages.value.flatMap((m) => m.role === 'user' ? [m.text.trim()] : []),
  )
)

/** Follow-up ideas, minus what was already asked. */
export const suggestions = computed(() =>
  (lastAnswer.value?.suggestions ?? defaultSuggestions(context.value.page))
    .filter((s) => !askedQuestions.value.has(s.trim()))
)

export const isEmpty = computed(() => messages.value.length === 0)

export const levelLabel = computed(() =>
  LEVELS.find((l) => l.id === level.value)?.label ?? ''
)

export const replyLanguage = computed(() =>
  conversationLanguage.value === 'mixed' ? 'wo' : conversationLanguage.value
)

/** WhatsApp-style status under the name. */
export const statusLine = computed(() =>
  voicePhase.value === 'listening'
    ? 't’écoute…'
    : voicePhase.value === 'processing'
    ? 'transcrit ton message…'
    : asking.value
    ? 'analyse les données…'
    : 'explique, ne conseille pas'
)

/** What the round button next to the input does right now. */
export const composerAction = computed<'mic' | 'recording' | 'send'>(() =>
  voicePhase.value === 'listening'
    ? recordingLocked.value ? 'send' : 'recording'
    : draft.value.trim()
    ? 'send'
    : 'mic'
)

export const recordingClock = computed(() => {
  const s = Math.floor(recordingSeconds.value)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

/** Where an answer comes from, in one short line. */
export const modeLabel = (answer: TekkiAnswer) =>
  answer.mode === 'deterministic'
    ? 'Calculé par Tekki'
    : answer.mode === 'knowledge-only' && answer.provider === 'tekki-analytics'
    ? 'Calculs Tekki · IA indisponible'
    : answer.mode === 'knowledge-only'
    ? 'Documentation · IA indisponible'
    : 'IA · données TekkiTrade'

export const detailsCount = (answer: TekkiAnswer) =>
  answer.facts.length + answer.sources.length + answer.points.length

export const STOCK_QUESTIONS = [
  'Explique-moi cette action comme si je débutais.',
  'Pourquoi le cours a bougé aujourd’hui ?',
  'C’est quoi le rendement du dividende ?',
]

const defaultSuggestions = (page: TekkiContext['page']) =>
  page === 'stock'
    ? [
      'Explique-moi ce que je regarde comme si je n’avais jamais investi.',
      'C’est quoi le rendement du dividende ?',
    ]
    : page === 'trader'
    ? [
      'D’où vient principalement sa performance ?',
      'Quels sont les principaux risques de sa stratégie ?',
    ]
    : [
      'C’est quoi une SGI ?',
      'Pourquoi diversifier son portefeuille ?',
      'Comment déposer de l’argent avec Bitnob ?',
    ]

/* -------------------------------------------------------------------------- */
/* Effects                                                                    */
/* -------------------------------------------------------------------------- */

// Keep the latest message in view, like a chat.
effect(() => {
  messages.value
  asking.value
  if (!isOpen.value) return
  requestAnimationFrame(() =>
    document.getElementById('tekki-thread-end')?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  )
})

/* -------------------------------------------------------------------------- */
/* Actions — conversation                                                     */
/* -------------------------------------------------------------------------- */

let statusLoaded = false
const loadStatus = async () => {
  if (statusLoaded) return
  statusLoaded = true
  try {
    const status = await tekkiApi.status()
    aiAvailable.value = status.reasoning.available
    voiceAvailable.value = status.speechToText.available
    localVoiceLanguages.value = status.textToSpeech.local ?? []
  } catch {
    statusLoaded = false
  }
}

let nextId = 0
const newId = () => `m${++nextId}`

const addMessage = (message: ChatMessage) => {
  messages.value = [...messages.value, message]
}

const updateMessage = (id: string, patch: Partial<UserMessage>) => {
  messages.value = messages.value.map((m) =>
    m.id === id && m.role === 'user' ? { ...m, ...patch } : m
  )
}

const resetConversation = () => {
  releaseNotes()
  messages.value = []
  detailsOpen.value = {}
  error.value = null
}

const sameContext = (a: TekkiContext, b: TekkiContext) =>
  a.page === b.page && a.label === b.label && a.amountFcfa === b.amountFcfa

/** The bottom bar's state before Tekki opened (a sheet may already hide it). */
let navHiddenBefore = false

export const openTekki = (ctx: TekkiContext, autoQuestion?: string) => {
  if (!isOpen.value) navHiddenBefore = isBottomNavHidden.value
  if (!sameContext(ctx, context.value)) resetConversation()
  context.value = ctx
  error.value = null
  isOpen.value = true
  isBottomNavHidden.value = true
  void loadStatus()
  if (autoQuestion) void ask(autoQuestion)
}

export const closeTekki = () => {
  cancelListening()
  stopVoice()
  isOpen.value = false
  isBottomNavHidden.value = navHiddenBefore
}

export const newConversation = () => resetConversation()

export const cycleLevel = () => {
  const index = LEVELS.findIndex((l) => l.id === level.value)
  level.value = LEVELS[(index + 1) % LEVELS.length].id
}

export const setDraft = (value: string) => {
  draft.value = value
}

export const setLanguage = (value: 'fr' | 'wo') => {
  conversationLanguage.value = value
}

export const toggleDetails = (id: string) => {
  detailsOpen.value = { ...detailsOpen.value, [id]: !detailsOpen.value[id] }
}

export const dismissError = () => {
  error.value = null
}

/**
 * Sends a question. Typed questions get a text answer (audio on demand);
 * spoken ones are answered out loud automatically, like a voice note.
 */
export const ask = async (
  questionOverride?: string,
  options: { retrievalQuery?: string; spoken?: boolean } = {},
) => {
  const question = (questionOverride ?? draft.value).trim()
  if (!question || asking.value) return
  interruptSpeech()
  if (!options.spoken) {
    addMessage({
      id: newId(),
      role: 'user',
      text: question,
      voice: false,
      transcribing: false,
    })
    draft.value = ''
  }
  asking.value = true
  error.value = null
  const id = newId()
  try {
    const answer = await tekkiApi.ask({
      question,
      context: context.value,
      level: level.value,
      language: conversationLanguage.value,
      retrievalQuery: options.retrievalQuery,
    })
    addMessage({ id, role: 'tekki', answer, error: null })
    if (options.spoken) void speakAnswer(id)
  } catch (err) {
    addMessage({
      id,
      role: 'tekki',
      answer: null,
      error: err instanceof Error ? err.message : 'Tekki n’a pas pu répondre.',
    })
  } finally {
    asking.value = false
  }
}

export const sendDraft = () => void ask()

/* -------------------------------------------------------------------------- */
/* Actions — voice notes                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The voice starts as soon as the first clip is ready, so the first clip is
 * short: the first sentence, cut at a comma when it is long (~3 s instead of
 * ~8 s on a laptop GPU). Then growing clips (~110, then ~200 characters).
 */
const FIRST_CLIP_MAX = 80

const splitFirst = (sentence: string) => {
  if (sentence.length <= FIRST_CLIP_MAX) return [sentence]
  const cut = sentence.slice(20, FIRST_CLIP_MAX).search(/[,:]\s/)
  return cut < 0
    ? [sentence]
    : [sentence.slice(0, cut + 21), sentence.slice(cut + 22)]
}

const splitForSpeech = (text: string) => {
  const [first = '', ...rest] = text.split(/(?<=[.!?;])\s+/)
  return [...splitFirst(first), ...rest].reduce<string[]>((out, sentence) => {
    const last = out.at(-1)
    // Growing clips: each one is generated while the previous one plays.
    const limit = out.length === 2 ? 110 : 200
    if (out.length > 1 && last && last.length + sentence.length < limit) {
      out[out.length - 1] = `${last} ${sentence}`
    } else out.push(sentence)
    return out
  }, []).filter((clip) => clip.trim())
}

const findAnswer = (id: string) => {
  const message = messages.value.find((m) => m.id === id)
  return message?.role === 'tekki' ? message.answer : null
}

/** Bumped by each new question: older answers stop being synthesized. */
let speechRun = 0

/**
 * A new question supersedes the previous answer's audio: stop it, keep it
 * from starting by itself later, and free the voice model for the new one.
 */
const interruptSpeech = () => {
  speechRun++
  holdAutoplay()
  stopVoice()
}

/** Turns an answer into a voice note that plays as soon as it starts. */
export const speakAnswer = async (id: string) => {
  const answer = findAnswer(id)
  if (!answer || voiceNotes.value[id]) return
  const run = ++speechRun
  createNote(id, true)
  // Only the local voice is split: with Gemini each clip would cost quota.
  const parts = localVoiceLanguages.value.includes(answer.language)
    ? splitForSpeech(answer.answer)
    : [answer.answer]
  try {
    for (const part of parts) {
      const audio = await tekkiApi.speak(part, answer.language)
      if (!voiceNotes.value[id]) return // conversation reset
      if (run !== speechRun) return failNote(id) // a newer question took over
      await appendClip(id, base64ToBytes(audio.base64), audio.mimeType)
    }
    completeNote(id)
  } catch {
    failNote(id)
  }
}

let recorder: Recorder | null = null
let recordingTimer: ReturnType<typeof setTimeout> | undefined
let recordingTicker: ReturnType<typeof setInterval> | undefined

const stopTimers = () => {
  clearTimeout(recordingTimer)
  clearInterval(recordingTicker)
  recordingLocked.value = false
}

const TAP_MS = 350
let pressedAt = 0
let micPressed = false
let releasedEarly = false
/** The click that follows a mic release must not count as "send". */
let ignoreClicksUntil = 0

/** Mic pressed: start recording (ignored when the button means "send"). */
export const pressMic = () => {
  if (composerAction.value !== 'mic') return
  micPressed = true
  pressedAt = Date.now()
  releasedEarly = false
  void startListening()
}

/** Mic released: a long press sends, a quick tap locks the recording. */
export const releaseMic = () => {
  if (!micPressed) return
  micPressed = false
  ignoreClicksUntil = Date.now() + 400
  if (voicePhase.value !== 'listening') {
    releasedEarly = true // still waiting for the microphone permission
    return
  }
  if (Date.now() - pressedAt < TAP_MS) recordingLocked.value = true
  else void stopListening()
}

/** The round button: send the text, send the locked recording, or nothing. */
export const pressAction = () => {
  if (Date.now() < ignoreClicksUntil) return
  if (composerAction.value !== 'send') return
  if (voicePhase.value === 'listening') void stopListening()
  else sendDraft()
}

export const startListening = async () => {
  if (voicePhase.value !== 'idle' || asking.value) return
  error.value = null
  interruptSpeech()
  try {
    recorder = await startRecording()
    voicePhase.value = 'listening'
    recordingLocked.value = releasedEarly
    recordingSeconds.value = 0
    const started = Date.now()
    recordingTicker = setInterval(() => {
      recordingSeconds.value = (Date.now() - started) / 1000
    }, 200)
    recordingTimer = setTimeout(() => void stopListening(), MAX_RECORDING_MS)
  } catch {
    error.value = 'Micro inaccessible. Autorise le micro ou écris ta question.'
    voicePhase.value = 'idle'
  }
}

export const cancelListening = () => {
  stopTimers()
  recorder?.cancel()
  recorder = null
  if (voicePhase.value === 'listening') voicePhase.value = 'idle'
}

/** Release: the recording becomes a voice note, then Tekki answers out loud. */
export const stopListening = async () => {
  if (!recorder || voicePhase.value !== 'listening') return
  stopTimers()
  const active = recorder
  recorder = null
  voicePhase.value = 'processing'
  const id = newId()
  try {
    const { wav, seconds } = await toWav16k(await active.stop())
    if (seconds < 0.6) {
      throw new Error('Trop court : maintiens le micro pendant que tu parles.')
    }
    createNote(id, false)
    await appendClip(id, wav, 'audio/wav')
    completeNote(id)
    addMessage({ id, role: 'user', text: '', voice: true, transcribing: true })
    const result = await tekkiApi.transcribe(bytesToBase64(wav), 'audio/wav')
    if (!result.text) {
      throw new Error('Je n’ai pas compris : réessaie plus près du micro.')
    }
    updateMessage(id, {
      text: result.text,
      transcribing: false,
      language: result.language,
    })
    if (result.language !== 'unknown') {
      conversationLanguage.value = result.language
    }
    voicePhase.value = 'idle'
    await ask(result.text, { retrievalQuery: result.frenchGloss, spoken: true })
  } catch (err) {
    updateMessage(id, { transcribing: false })
    error.value = err instanceof Error
      ? err.message
      : 'Transcription impossible : écris ta question.'
  } finally {
    voicePhase.value = 'idle'
  }
}

/* -------------------------------------------------------------------------- */
/* Actions — stock sheet                                                      */
/* -------------------------------------------------------------------------- */

/** From the market's stock sheet: a conversation about that stock. */
export const askAboutStock = (
  stock: { symbol: string; name: string },
  question?: string,
) =>
  openTekki({
    page: 'stock',
    stockSymbol: stock.symbol,
    label: `${stock.symbol} · ${stock.name}`,
  }, question)

/* -------------------------------------------------------------------------- */
/* Actions — trader, trade                                                       */
/* -------------------------------------------------------------------------- */

export const analyzeTrader = (traderId: string, name: string) =>
  openTekki(
    { page: 'trader', traderId, label: `Profil de ${name}` },
    `Qu’est-ce qui ressort du comportement de ${name} ?`,
  )

export const understandTrade = async (
  traderId: string,
  handle: string,
  symbol: string,
) => {
  try {
    const data = await tekkiApi.postTrade(traderId, symbol)
    openTekki(
      {
        page: 'trade',
        traderId,
        tradeId: data.trade.tradeId,
        label: `Opération de @${handle} sur ${symbol}`,
      },
      'Que montre cette opération, d’après les données ?',
    )
  } catch {
    // No logged trade on that stock for this profile: explain the stock.
    openTekki(
      { page: 'stock', stockSymbol: symbol, label: symbol },
      `Que faut-il comprendre sur ${symbol} ?`,
    )
  }
}
