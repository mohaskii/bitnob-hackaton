import { encodeBase64 } from '@std/encoding/base64'
import {
  AI_PROVIDER,
  GEMINI_API_KEY,
  GEMINI_BASE_URL,
  GEMINI_MODEL,
  GEMINI_TTS_MODEL,
  GEMINI_TTS_VOICE,
  OLLAMA_API_KEY,
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
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

const geminiCall = async (model: string, body: Record<string, unknown>) => {
  const res = await fetch(
    `${GEMINI_BASE_URL}/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45_000),
    },
  ).catch((err) => {
    throw new ProviderError(`Gemini injoignable : ${String(err)}`)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ProviderError(
      data?.error?.message ?? `Gemini a répondu ${res.status}`,
    )
  }
  const parts: GeminiPart[] = data?.candidates?.[0]?.content?.parts ?? []
  return parts
}

export const geminiProvider: AIProvider = {
  name: 'gemini',
  model: GEMINI_MODEL,
  available: Boolean(GEMINI_API_KEY),
  async chat({ system, user, json, temperature = 0.3 }) {
    const parts = await geminiCall(GEMINI_MODEL, {
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
    const parts = await geminiCall(GEMINI_MODEL, {
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: encodeBase64(audio) } },
          {
            text:
              'Transcris fidèlement cet audio. La personne parle wolof, français, ou un mélange des deux. ' +
              'Ne réponds pas à la question, transcris-la seulement. Réponds en JSON : ' +
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

const decodeBase64 = (value: string) =>
  Uint8Array.from(atob(value), (c) => c.charCodeAt(0))

export const geminiTextToSpeech: TextToSpeechProvider = {
  name: 'gemini-tts',
  available: Boolean(GEMINI_API_KEY),
  async synthesize(text, { language }) {
    const style = language === 'wo'
      ? 'Lis ce texte en wolof, d’une voix calme et claire, comme un conseiller bienveillant : '
      : 'Lis ce texte en français, d’une voix calme et claire : '
    const parts = await geminiCall(GEMINI_TTS_MODEL, {
      contents: [{ role: 'user', parts: [{ text: style + text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_TTS_VOICE } },
        },
      },
    })
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
export const textToSpeech: TextToSpeechProvider = geminiTextToSpeech

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
  },
})
