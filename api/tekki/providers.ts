import { decodeBase64, encodeBase64 } from '@std/encoding/base64'
import { log } from '../lib/log.ts'
import {
  AI_PROVIDER,
  GEMINI_API_KEY,
  GEMINI_BASE_URL,
  GEMINI_FALLBACK_MODELS,
  GEMINI_MODEL,
  GEMINI_THINKING_LEVEL,
  GEMINI_TTS_FALLBACK_MODELS,
  GEMINI_TTS_MODEL,
  GEMINI_TTS_VOICE,
  OLLAMA_API_KEY,
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  OOLEL_TTS_URL,
} from '../lib/env.ts'

/**
 * Provider abstractions for Tekki AI and Tekki Voice. Reasoning, speech-to-text
 * and text-to-speech can each be swapped without touching the assistant.
 * API keys stay on the server: the browser only talks to Tekki's backend.
 */

export type AIChatRequest = {
  system: string
  user: string
  /** Ask for a JSON object as the whole answer. */
  json?: boolean
  temperature?: number
}

export type AIProvider = {
  name: string
  model: string
  available: boolean
  chat(input: AIChatRequest): Promise<string>
}

export type Transcript = {
  text: string
  language: 'wo' | 'fr' | 'mixed' | 'unknown'
  confidence?: number
  /** French rendering of the question, used for document retrieval. */
  frenchGloss?: string
}

export type SpeechToTextProvider = {
  name: string
  available: boolean
  transcribe(audio: Uint8Array, mimeType: string): Promise<Transcript>
}

export type AudioResult = { mimeType: string; base64: string }

export type TextToSpeechProvider = {
  name: string
  available: boolean
  synthesize(text: string, options: { language: string }): Promise<AudioResult>
}

export class ProviderError extends Error {}

/* -------------------------------------------------------------------------- */
/* Gemini                                                                     */
/* -------------------------------------------------------------------------- */

type GeminiPart = {
  text?: string
  inlineData?: { mimeType: string; data: string }
}

/** Statuses that mean "this model, not now": move on to the next one. */
const RETRYABLE = new Set([429, 500, 502, 503, 504])

class GeminiHttpError extends ProviderError {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterMs = 0,
  ) {
    super(message)
  }
}

/**
 * Models to skip until a given time. Free-tier quotas are per model and per
 * day, and an overloaded model answers 503 after ~20 s: waiting on it again
 * would make every question slow. Skipping it keeps answers at ~2 s.
 */
const cooldownUntil = new Map<string, number>()
const OVERLOAD_COOLDOWN_MS = 5 * 60_000
/** Models that reject `thinkingLevel` (detected on first 400). */
const noThinkingConfig = new Set<string>()

const retryDelayMs = (data: unknown) => {
  const details = (data as { error?: { details?: { retryDelay?: string }[] } })
    ?.error?.details ?? []
  const delay = details.find((d) => d?.retryDelay)?.retryDelay
  return delay ? Number.parseFloat(delay) * 1000 : 0
}

const geminiOnce = async (
  model: string,
  body: Record<string, unknown>,
  timeoutMs: number,
) => {
  const res = await fetch(
    `${GEMINI_BASE_URL}/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    },
  ).catch((err) => {
    throw new GeminiHttpError(`Gemini injoignable : ${String(err)}`, 503)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new GeminiHttpError(
      data?.error?.message ?? `Gemini a répondu ${res.status}`,
      res.status,
      retryDelayMs(data),
    )
  }
  const parts: GeminiPart[] = data?.candidates?.[0]?.content?.parts ?? []
  return parts
}

const withThinking = (body: Record<string, unknown>) => {
  if (!GEMINI_THINKING_LEVEL) return body
  const generationConfig = (body.generationConfig ?? {}) as Record<
    string,
    unknown
  >
  return {
    ...body,
    generationConfig: {
      ...generationConfig,
      thinkingConfig: { thinkingLevel: GEMINI_THINKING_LEVEL },
    },
  }
}

/**
 * Tries each model of the chain once, skipping those in cooldown. A model
 * that is out of quota or overloaded is parked and the next one answers
 * right away, so a demo never waits on a saturated model.
 */
const geminiCall = async (
  models: string[],
  body: Record<string, unknown>,
  options: { thinking?: boolean; timeoutMs?: number } = {},
) => {
  const { thinking = true, timeoutMs = 10_000 } = options
  const now = Date.now()
  const ready = models.filter((m) => (cooldownUntil.get(m) ?? 0) <= now)
  let lastError: unknown = new ProviderError(
    'Quota Gemini atteint sur tous les modèles, réessaie plus tard.',
  )
  for (const model of ready) {
    const started = performance.now()
    const withConfig = thinking && !noThinkingConfig.has(model)
    try {
      const parts = await geminiOnce(
        model,
        withConfig ? withThinking(body) : body,
        timeoutMs,
      )
      log.info('[Gemini] ok', {
        model,
        ms: Math.round(performance.now() - started),
      })
      return parts
    } catch (error) {
      lastError = error
      const status = error instanceof GeminiHttpError ? error.status : 0
      log.warn('[Gemini] fallback', {
        model,
        status,
        ms: Math.round(performance.now() - started),
      })
      if (RETRYABLE.has(status)) {
        const wait = error instanceof GeminiHttpError && error.retryAfterMs
          ? error.retryAfterMs
          : OVERLOAD_COOLDOWN_MS
        cooldownUntil.set(model, Date.now() + wait)
      } else if (status === 404) {
        cooldownUntil.set(model, Infinity) // unknown model: never retry it
      } else if (status === 400 && withConfig) {
        // Some models reject thinkingLevel: send it without from now on.
        noThinkingConfig.add(model)
        ready.splice(ready.indexOf(model) + 1, 0, model)
      }
    }
  }
  throw lastError instanceof ProviderError
    ? lastError
    : new ProviderError('Gemini indisponible.')
}

const modelChain = (primary: string, fallbacks: string) =>
  [primary, ...fallbacks.split(',').map((m) => m.trim()).filter(Boolean)]
    .filter((m, i, all) => all.indexOf(m) === i)

const TEXT_MODELS = modelChain(GEMINI_MODEL, GEMINI_FALLBACK_MODELS)
const TTS_MODELS = modelChain(GEMINI_TTS_MODEL, GEMINI_TTS_FALLBACK_MODELS)

export const geminiProvider: AIProvider = {
  name: 'gemini',
  model: GEMINI_MODEL,
  available: Boolean(GEMINI_API_KEY),
  async chat({ system, user, json, temperature = 0.3 }) {
    const parts = await geminiCall(TEXT_MODELS, {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    })
    const text = parts.map((p) => p.text ?? '').join('')
    if (!text) throw new ProviderError('Réponse Gemini vide.')
    return text
  },
}

export const geminiSpeechToText: SpeechToTextProvider = {
  name: 'gemini-stt',
  available: Boolean(GEMINI_API_KEY),
  async transcribe(audio, mimeType) {
    const parts = await geminiCall(TEXT_MODELS, {
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: encodeBase64(audio) } },
          {
            text:
              'Transcris fidèlement cet audio. La personne parle wolof, français, ou un mélange des deux. ' +
              'Ne réponds pas à la question, transcris-la seulement. ' +
              'Contexte : une app d’éducation à la bourse BRVM. Vocabulaire probable : Sonatel, Orange Côte d’Ivoire, ' +
              'SGBCI, Ecobank, Société Générale, BRVM, SGI, action/aksiyoŋ, njëg (prix), wàcc (baisser), yokku (monter), ' +
              'jënd (acheter), jaay (vendre), xaalis (argent), portefeuille, dividende, frais, risque. ' +
              'Réponds en JSON : ' +
              '{"text": transcription exacte dans la langue parlée (wolof en orthographe officielle CLAD), ' +
              '"language": "wo" | "fr" | "mixed" | "unknown", "confidence": nombre entre 0 et 1, ' +
              '"frenchGloss": traduction française fidèle de la question}. Si l’audio est vide ou inaudible, text = "".',
          },
        ],
      }],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
      },
    })
    const raw = parts.map((p) => p.text ?? '').join('')
    try {
      const parsed = JSON.parse(raw)
      const language = ['wo', 'fr', 'mixed'].includes(parsed.language)
        ? parsed.language
        : 'unknown'
      return {
        text: String(parsed.text ?? '').trim(),
        language,
        confidence: typeof parsed.confidence === 'number'
          ? parsed.confidence
          : undefined,
        frenchGloss: parsed.frenchGloss
          ? String(parsed.frenchGloss)
          : undefined,
      }
    } catch {
      throw new ProviderError('Transcription illisible.')
    }
  },
}

/** Wraps raw 16-bit little-endian mono PCM in a WAV container. */
const pcmToWav = (pcm: Uint8Array, sampleRate = 24_000) => {
  const header = new ArrayBuffer(44)
  const view = new DataView(header)
  const write = (offset: number, text: string) =>
    [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  write(0, 'RIFF')
  view.setUint32(4, 36 + pcm.length, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, pcm.length, true)
  const wav = new Uint8Array(44 + pcm.length)
  wav.set(new Uint8Array(header), 0)
  wav.set(pcm, 44)
  return wav
}

export const geminiTextToSpeech: TextToSpeechProvider = {
  name: 'gemini-tts',
  available: Boolean(GEMINI_API_KEY),
  async synthesize(text) {
    // Text only: a style instruction in the prompt ("Lis ce texte…") ends up
    // read aloud at the start of the audio. The voice is set by speechConfig.
    const parts = await geminiCall(TTS_MODELS, {
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_TTS_VOICE } },
        },
      },
    }, { thinking: false, timeoutMs: 15_000 })
    const audio = parts.find((p) => p.inlineData)?.inlineData
    if (!audio) throw new ProviderError('Pas d’audio renvoyé par Gemini.')
    const rate = Number(audio.mimeType.match(/rate=(\d+)/)?.[1] ?? 24_000)
    const bytes = decodeBase64(audio.data)
    return audio.mimeType.includes('wav')
      ? { mimeType: 'audio/wav', base64: audio.data }
      : { mimeType: 'audio/wav', base64: encodeBase64(pcmToWav(bytes, rate)) }
  },
}

/* -------------------------------------------------------------------------- */
/* Ollama (cloud or local)                                                    */
/* -------------------------------------------------------------------------- */

export const ollamaProvider: AIProvider = {
  name: AI_PROVIDER === 'ollama-local' ? 'ollama-local' : 'ollama-cloud',
  model: OLLAMA_MODEL,
  available: AI_PROVIDER === 'ollama-local' || Boolean(OLLAMA_API_KEY),
  async chat({ system, user, json, temperature = 0.3 }) {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OLLAMA_API_KEY
          ? { Authorization: `Bearer ${OLLAMA_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        ...(json ? { format: 'json' } : {}),
        options: { temperature },
        messages: [{ role: 'system', content: system }, {
          role: 'user',
          content: user,
        }],
      }),
      signal: AbortSignal.timeout(60_000),
    }).catch((err) => {
      throw new ProviderError(`Ollama injoignable : ${String(err)}`)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new ProviderError(data?.error ?? `Ollama a répondu ${res.status}`)
    }
    const text = data?.message?.content
    if (!text) throw new ProviderError('Réponse Ollama vide.')
    return text
  },
}

/* -------------------------------------------------------------------------- */
/* Selection                                                                  */
/* -------------------------------------------------------------------------- */

export const reasoningProvider: AIProvider = AI_PROVIDER.startsWith('ollama')
  ? ollamaProvider
  : geminiProvider

export const speechToText: SpeechToTextProvider = geminiSpeechToText
/* -------------------------------------------------------------------------- */
/* Oolel-Voices (Soynade Research), Wolof speech                              */
/* -------------------------------------------------------------------------- */

/** Local model built for Wolof: more natural than Gemini, no quota. */
export const oolelTextToSpeech: TextToSpeechProvider = {
  name: 'oolel-voices',
  available: Boolean(OOLEL_TTS_URL),
  async synthesize(text) {
    const res = await fetch(`${OOLEL_TTS_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(60_000),
    }).catch((err) => {
      throw new ProviderError(`Oolel injoignable : ${String(err)}`)
    })
    // 503 while the model loads: the caller falls back to Gemini.
    if (!res.ok) throw new ProviderError(`Oolel a répondu ${res.status}`)
    return {
      mimeType: 'audio/wav',
      base64: encodeBase64(new Uint8Array(await res.arrayBuffer())),
    }
  },
}

/** After a failure, Oolel is skipped for a while instead of retried per clip. */
let oolelDownUntil = 0
const OOLEL_RETRY_MS = 30_000

/**
 * Wolof (and mixed) answers are read by Oolel-Voices when its sidecar is
 * configured, French by Gemini. Gemini takes over whenever Oolel fails.
 */
export const textToSpeech: TextToSpeechProvider = {
  name: 'tekki-voice',
  available: geminiTextToSpeech.available || oolelTextToSpeech.available,
  async synthesize(text, options) {
    if (
      options.language !== 'fr' && oolelTextToSpeech.available &&
      Date.now() >= oolelDownUntil
    ) {
      try {
        return await oolelTextToSpeech.synthesize(text, options)
      } catch (error) {
        oolelDownUntil = Date.now() + OOLEL_RETRY_MS
        log.warn('[Oolel] fallback to Gemini', { error: String(error) })
      }
    }
    return await geminiTextToSpeech.synthesize(text, options)
  },
}

export const providerStatus = () => ({
  reasoning: {
    provider: reasoningProvider.name,
    model: reasoningProvider.model,
    available: reasoningProvider.available,
  },
  speechToText: {
    provider: speechToText.name,
    available: speechToText.available,
  },
  textToSpeech: {
    provider: textToSpeech.name,
    available: textToSpeech.available,
    wolof: oolelTextToSpeech.available ? 'oolel-voices' : 'gemini-tts',
  },
})
