/**
 * Push-to-talk capture. Pure helpers (no signals).
 * The browser records in its native format (often WebM/Opus), then we convert
 * to 16 kHz mono WAV, a format every speech-to-text provider accepts.
 */

export type Recorder = { stop: () => Promise<Blob>; cancel: () => void }

export const startRecording = async (): Promise<Recorder> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const recorder = new MediaRecorder(stream)
  const chunks: Blob[] = []
  recorder.ondataavailable = (event) =>
    event.data.size && chunks.push(event.data)
  recorder.start()
  const release = () => stream.getTracks().forEach((track) => track.stop())
  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          release()
          resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }))
        }
        recorder.stop()
      }),
    cancel: () => {
      recorder.onstop = release
      recorder.state !== 'inactive' ? recorder.stop() : release()
    },
  }
}

const encodeWav = (samples: Float32Array, sampleRate: number) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const write = (offset: number, text: string) =>
    [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  write(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  samples.forEach((sample, i) => {
    const s = Math.max(-1, Math.min(1, sample))
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  })
  return new Uint8Array(buffer)
}

/** Decodes any recorded blob and returns 16 kHz mono WAV bytes + duration. */
export const toWav16k = async (blob: Blob) => {
  const decoder = new AudioContext()
  const decoded = await decoder.decodeAudioData(await blob.arrayBuffer())
  await decoder.close()
  const rate = 16_000
  const offline = new OfflineAudioContext(
    1,
    Math.ceil(decoded.duration * rate),
    rate,
  )
  const source = offline.createBufferSource()
  source.buffer = decoded
  source.connect(offline.destination)
  source.start()
  const rendered = await offline.startRendering()
  return {
    wav: encodeWav(rendered.getChannelData(0), rate),
    seconds: decoded.duration,
  }
}

export const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}
