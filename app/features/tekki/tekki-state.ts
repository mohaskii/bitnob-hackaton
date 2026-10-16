import { computed, signal } from '@preact/signals'
import { isBottomNavHidden } from '../../state.ts'
import {
  bytesToBase64,
  type Recorder,
  startRecording,
  toWav16k,
} from './audio.ts'
import {
  type PostTrade,
  type RealStock,
  type TekkiAnswer,
  tekkiApi,
  type TekkiContext,
  type Transcript,
} from './tekki-api.ts'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Level = 'beginner' | 'investor' | 'advanced'
export type VoicePhase =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'review'
  | 'thinking'

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

const MAX_RECORDING_MS = 30_000

/* -------------------------------------------------------------------------- */
/* Signals                                                                    */
/* -------------------------------------------------------------------------- */

export const isOpen = signal(false)
export const context = signal<TekkiContext>({ page: 'general' })
export const level = signal<Level>('beginner')
export const draft = signal('')
export const asking = signal(false)
export const answer = signal<TekkiAnswer | null>(null)
export const lastQuestion = signal('')
export const error = signal<string | null>(null)
export const factsExpanded = signal(false)

export const voicePhase = signal<VoicePhase>('idle')
export const transcript = signal<Transcript | null>(null)
/** Language of the conversation, remembered for the session. */
export const conversationLanguage = signal<'fr' | 'wo' | 'mixed'>('fr')

export const audioUrl = signal<string | null>(null)
export const audioLoading = signal(false)
export const audioError = signal<string | null>(null)

export const voiceAvailable = signal(false)
export const aiAvailable = signal(false)

export const selectedStock = signal<RealStock | null>(null)

export const replicateOpen = signal(false)
export const replicateTarget = signal<
  { traderId: string; handle: string; data: PostTrade } | null
>(null)
export const replicateAmount = signal(10_000)
export const replicatePreview = signal<{ label: string; value: string }[]>([])
export const replicateLoading = signal(false)

/* -------------------------------------------------------------------------- */
/* Computeds                                                                  */
/* -------------------------------------------------------------------------- */

export const suggestions = computed(() =>
  answer.value?.suggestions ?? defaultSuggestions(context.value.page)
)

export const factPoints = computed(() =>
  (answer.value?.points ?? []).filter((p) => p.type === 'FACT')
)
export const interpretationPoints = computed(() =>
  (answer.value?.points ?? []).filter((p) => p.type === 'INTERPRETATION')
)

export const replicateFacts = computed(() =>
  replicatePreview.value.filter((f) =>
    /^(Montant envisagé|Ton exposition|Frais estimés|Ton cash|Prix d’entrée)/
      .test(f.label)
  )
)

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
/* Actions — assistant                                                        */
/* -------------------------------------------------------------------------- */

let statusLoaded = false
const loadStatus = async () => {
  if (statusLoaded) return
  statusLoaded = true
  try {
    const status = await tekkiApi.status()
    aiAvailable.value = status.reasoning.available
    voiceAvailable.value = status.speechToText.available
  } catch {
    statusLoaded = false
  }
}

const clearAudio = () => {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioUrl.value = null
  audioError.value = null
}

export const openTekki = (ctx: TekkiContext, autoQuestion?: string) => {
  context.value = ctx
  answer.value = null
  error.value = null
  draft.value = ''
  transcript.value = null
  voicePhase.value = 'idle'
  factsExpanded.value = false
  clearAudio()
  isOpen.value = true
  isBottomNavHidden.value = true
  void loadStatus()
  if (autoQuestion) void ask(autoQuestion)
}

export const closeTekki = () => {
  cancelListening()
  clearAudio()
  isOpen.value = false
  isBottomNavHidden.value = replicateOpen.value || selectedStock.value !== null
}

export const setLevel = (value: Level) => {
  level.value = value
}

export const setDraft = (value: string) => {
  draft.value = value
}

export const toggleFacts = () => {
  factsExpanded.value = !factsExpanded.value
}

export const ask = async (
  questionOverride?: string,
  retrievalQuery?: string,
) => {
  const question = (questionOverride ?? draft.value).trim()
  if (!question || asking.value) return
  asking.value = true
  error.value = null
  lastQuestion.value = question
  clearAudio()
  try {
    answer.value = await tekkiApi.ask({
      question,
      context: context.value,
      level: level.value,
      language: conversationLanguage.value,
      retrievalQuery,
    })
    draft.value = ''
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : 'Tekki n’a pas pu répondre.'
  } finally {
    asking.value = false
    voicePhase.value = 'idle'
  }
}

export const setLanguage = (value: 'fr' | 'wo') => {
  conversationLanguage.value = value
}

/* -------------------------------------------------------------------------- */
/* Actions — voice (push-to-talk)                                             */
/* -------------------------------------------------------------------------- */

let recorder: Recorder | null = null
let recordingTimer: ReturnType<typeof setTimeout> | undefined

export const startListening = async () => {
  if (voicePhase.value !== 'idle' && voicePhase.value !== 'review') return
  error.value = null
  try {
    recorder = await startRecording()
    voicePhase.value = 'listening'
    recordingTimer = setTimeout(() => void stopListening(), MAX_RECORDING_MS)
  } catch {
    error.value =
      'Micro inaccessible. Autorise le micro ou utilise le mode texte.'
    voicePhase.value = 'idle'
  }
}

export const cancelListening = () => {
  clearTimeout(recordingTimer)
  recorder?.cancel()
  recorder = null
  if (voicePhase.value === 'listening') voicePhase.value = 'idle'
}

export const stopListening = async () => {
  if (!recorder || voicePhase.value !== 'listening') return
  clearTimeout(recordingTimer)
  const active = recorder
  recorder = null
  voicePhase.value = 'transcribing'
  try {
    const blob = await active.stop()
    const { wav, seconds } = await toWav16k(blob)
    if (seconds < 0.5) {
      throw new Error(
        'Je n’ai rien entendu. Maintiens le bouton pendant que tu parles.',
      )
    }
    const result = await tekkiApi.transcribe(bytesToBase64(wav), 'audio/wav')
    transcript.value = result
    if (result.language === 'wo' || result.language === 'mixed') {
      conversationLanguage.value = result.language
    } else if (result.language === 'fr') {
      conversationLanguage.value = 'fr'
    }
    draft.value = result.text
    voicePhase.value = 'review'
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : 'Transcription impossible : utilise le mode texte.'
    voicePhase.value = 'idle'
  }
}

/** Sends the (possibly edited) transcript to Tekki AI. */
export const sendTranscript = () => {
  voicePhase.value = 'thinking'
  void ask(draft.value, transcript.value?.frenchGloss)
}

const base64ToBlobUrl = (base64: string, mimeType: string) => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }))
}

/** Text answer first; audio is optional and never blocks the answer. */
export const listenToAnswer = async () => {
  const current = answer.value
  if (!current || audioLoading.value) return
  audioLoading.value = true
  audioError.value = null
  try {
    const audio = await tekkiApi.speak(current.answer, current.language)
    clearAudio()
    audioUrl.value = base64ToBlobUrl(audio.base64, audio.mimeType)
  } catch {
    audioError.value =
      'Audio indisponible : la réponse écrite reste disponible.'
  } finally {
    audioLoading.value = false
  }
}

/* -------------------------------------------------------------------------- */
/* Actions — stock detail                                                     */
/* -------------------------------------------------------------------------- */

export const openStockDetail = (stock: RealStock) => {
  selectedStock.value = stock
  isBottomNavHidden.value = true
}

export const closeStockDetail = () => {
  selectedStock.value = null
  isBottomNavHidden.value = false
}

export const askAboutStock = (autoQuestion?: string) => {
  const stock = selectedStock.value
  if (!stock) return
  openTekki({
    page: 'stock',
    stockSymbol: stock.symbol,
    label: `${stock.symbol} · ${stock.name}`,
  }, autoQuestion)
}

/* -------------------------------------------------------------------------- */
/* Actions — trader, trade, replication                                       */
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
  } catch (err) {
    openTekki({ page: 'general' })
    error.value = err instanceof Error ? err.message : 'Opération introuvable.'
  }
}

const refreshReplicatePreview = async () => {
  const target = replicateTarget.value
  if (!target) return
  replicateLoading.value = true
  try {
    replicatePreview.value = (await tekkiApi.facts({
      page: 'replicate',
      traderId: target.traderId,
      tradeId: target.data.trade.tradeId,
      amountFcfa: replicateAmount.value,
    })).facts
  } catch {
    replicatePreview.value = []
  } finally {
    replicateLoading.value = false
  }
}

export const openReplicate = async (
  traderId: string,
  handle: string,
  symbol: string,
) => {
  try {
    const data = await tekkiApi.postTrade(traderId, symbol)
    replicateTarget.value = { traderId, handle, data }
    replicateOpen.value = true
    isBottomNavHidden.value = true
    await refreshReplicatePreview()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Opération introuvable.'
  }
}

export const closeReplicate = () => {
  replicateOpen.value = false
  replicateTarget.value = null
  replicatePreview.value = []
  isBottomNavHidden.value = false
}

let amountTimer: ReturnType<typeof setTimeout> | undefined
export const setReplicateAmount = (value: number) => {
  replicateAmount.value = Math.max(0, Math.round(value || 0))
  clearTimeout(amountTimer)
  amountTimer = setTimeout(() => void refreshReplicatePreview(), 300)
}

export const explainReplicateImpact = () => {
  const target = replicateTarget.value
  if (!target) return
  openTekki(
    {
      page: 'replicate',
      traderId: target.traderId,
      tradeId: target.data.trade.tradeId,
      amountFcfa: replicateAmount.value,
      label: `Répliquer ${target.data.trade.symbol} · ${
        replicateAmount.value.toLocaleString('fr-FR')
      } FCFA`,
    },
    'Explique-moi l’impact de cette opération sur mon portefeuille et les risques à comprendre.',
  )
}
