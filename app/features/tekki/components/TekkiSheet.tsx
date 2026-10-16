import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from 'lucide-preact'
import {
  aiAvailable,
  answer,
  ask,
  asking,
  audioEnded,
  audioError,
  audioLoading,
  audioPending,
  audioUrl,
  cancelListening,
  closeTekki,
  context,
  conversationLanguage,
  draft,
  error,
  factPoints,
  factsExpanded,
  interpretationPoints,
  isOpen,
  LANGUAGE_LABELS,
  lastQuestion,
  level,
  LEVELS,
  listenToAnswer,
  sendTranscript,
  setDraft,
  setLanguage,
  setLevel,
  startListening,
  stopListening,
  suggestions,
  toggleFacts,
  transcript,
  voiceAvailable,
  voicePhase,
} from '../tekki-state.ts'

const VOICE_STEPS: Record<string, string> = {
  listening: 'Je t’écoute…',
  transcribing: 'Transcription…',
  review: 'Vérifie la transcription puis envoie',
  thinking: 'J’analyse les données…',
}

const TekkiHeader = () => (
  <div class='flex items-start justify-between gap-3'>
    <div class='min-w-0'>
      <div class='flex items-center gap-2'>
        <span class='w-8 h-8 rounded-xl bg-primary text-primary-content flex items-center justify-center'>
          <Sparkles size={16} />
        </span>
        <span class='text-base font-extrabold'>Tekki AI</span>
      </div>
      {context.value.label && (
        <span class='mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-base-200 text-[11px] font-semibold text-base-content/70'>
          Contexte : {context.value.label}
        </span>
      )}
    </div>
    <button
      type='button'
      onClick={closeTekki}
      aria-label='Fermer'
      class='w-9 h-9 rounded-full bg-base-200 flex items-center justify-center cursor-pointer'
    >
      <X size={18} />
    </button>
  </div>
)

const LevelPicker = () => (
  <div class='flex items-center gap-1.5'>
    {LEVELS.map((item) => (
      <button
        key={item.id}
        type='button'
        onClick={() => setLevel(item.id)}
        class={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
          level.value === item.id
            ? 'bg-secondary text-secondary-content'
            : 'bg-base-200 text-base-content/60'
        }`}
      >
        {item.label}
      </button>
    ))}
    <span class='flex-1' />
    {(['fr', 'wo'] as const).map((lang) => (
      <button
        key={lang}
        type='button'
        onClick={() => setLanguage(lang)}
        class={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
          (conversationLanguage.value === 'mixed'
              ? 'wo'
              : conversationLanguage.value) === lang
            ? 'bg-primary text-primary-content'
            : 'bg-base-200 text-base-content/60'
        }`}
      >
        {lang === 'fr' ? 'FR' : 'WO'}
      </button>
    ))}
  </div>
)

const Suggestions = () =>
  asking.value
    ? null
    : (
      <div class='flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1'>
        {suggestions.value.map((s) => (
          <button
            key={s}
            type='button'
            onClick={() => void ask(s)}
            class='flex-shrink-0 max-w-[260px] text-left px-3 py-2 rounded-2xl bg-base-200 text-[12px] font-semibold cursor-pointer'
          >
            {s}
          </button>
        ))}
      </div>
    )

const ModeBadge = () => {
  const current = answer.value
  if (!current) return null
  const label = current.mode === 'deterministic'
    ? 'Réponse calculée par Tekki Analytics'
    : current.mode === 'knowledge-only' &&
        current.provider === 'tekki-analytics'
    ? 'Explication assemblée à partir des calculs (IA indisponible)'
    : current.mode === 'knowledge-only'
    ? 'Réponse issue de la base documentaire (IA indisponible)'
    : `Explication IA · ${current.provider}`
  return (
    <span class='text-[10px] font-bold uppercase tracking-wide text-base-content/45'>
      {label}
    </span>
  )
}

const AudioControls = () => {
  if (!answer.value) return null
  return (
    <div class='flex flex-col gap-2'>
      {audioUrl.value
        ? (
          <audio
            src={audioUrl.value}
            controls
            autoPlay
            onEnded={audioEnded}
            class='w-full h-10'
          />
        )
        : (
          <button
            type='button'
            onClick={() => void listenToAnswer()}
            disabled={audioLoading.value || !voiceAvailable.value}
            class='self-start h-9 px-3.5 rounded-full bg-base-200 text-[12px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40'
          >
            {audioLoading.value
              ? <Loader2 size={14} class='animate-spin' />
              : <Volume2 size={14} />}
            Écouter
          </button>
        )}
      {audioUrl.value && audioPending.value && (
        <p class='text-[11px] text-base-content/50 flex items-center gap-1.5'>
          <Loader2 size={12} class='animate-spin' /> La suite se prépare…
        </p>
      )}
      {audioError.value && (
        <p class='text-[11px] text-base-content/50'>{audioError.value}</p>
      )}
    </div>
  )
}

const Points = () => (
  <div class='flex flex-col gap-2'>
    {interpretationPoints.value.map((p) => (
      <p key={p.text} class='text-[12.5px] leading-relaxed'>
        <span class='text-[10px] font-black uppercase text-primary-content bg-primary rounded px-1.5 py-0.5 mr-1.5'>
          Interprétation
        </span>
        {p.text}
      </p>
    ))}
    {factPoints.value.map((p) => (
      <p
        key={p.text}
        class='text-[12.5px] leading-relaxed text-base-content/80'
      >
        <span class='text-[10px] font-black uppercase bg-base-200 rounded px-1.5 py-0.5 mr-1.5'>
          Fait
        </span>
        {p.text}
      </p>
    ))}
  </div>
)

const FactsTable = () => {
  const facts = answer.value?.facts ?? []
  if (facts.length === 0) return null
  return (
    <div class='bg-base-200 rounded-2xl'>
      <button
        type='button'
        onClick={toggleFacts}
        class='w-full flex items-center justify-between px-3.5 py-2.5 text-[12px] font-bold cursor-pointer'
      >
        Données utilisées ({facts.length}) — calculées par TekkiTrade
        <ChevronDown
          size={15}
          class={factsExpanded.value ? 'rotate-180' : ''}
        />
      </button>
      {factsExpanded.value && (
        <dl class='px-3.5 pb-3 flex flex-col gap-1.5'>
          {facts.map((f) => (
            <div key={f.label} class='flex justify-between gap-3 text-[11.5px]'>
              <dt class='text-base-content/55'>{f.label}</dt>
              <dd class='font-bold text-right'>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

const Sources = () => {
  const sources = answer.value?.sources ?? []
  if (sources.length === 0) return null
  return (
    <div class='flex flex-col gap-1'>
      <span class='text-[10px] font-bold uppercase tracking-wide text-base-content/45'>
        Sources
      </span>
      {sources.map((s) =>
        s.url
          ? (
            <a
              key={s.id}
              href={s.url}
              target='_blank'
              rel='noreferrer'
              class='text-[12px] font-semibold flex items-center gap-1 underline decoration-base-300'
            >
              {s.source} <ExternalLink size={11} />
            </a>
          )
          : (
            <span
              key={s.id}
              class='text-[12px] font-semibold text-base-content/70'
            >
              {s.source}
            </span>
          )
      )}
    </div>
  )
}

const AnswerCard = () => {
  const current = answer.value
  if (asking.value) {
    return (
      <div class='bg-base-100 rounded-3xl p-4 flex items-center gap-2 text-[13px] font-semibold text-base-content/60'>
        <Loader2 size={16} class='animate-spin' />{' '}
        Tekki prépare une explication à partir des données…
      </div>
    )
  }
  if (!current) return null
  return (
    <div class='bg-base-100 rounded-3xl p-4 flex flex-col gap-3'>
      <p class='text-[12px] font-semibold text-base-content/50'>
        « {lastQuestion.value} »
      </p>
      <ModeBadge />
      <p class='text-[14px] leading-relaxed'>{current.answer}</p>
      <AudioControls />
      <Points />
      {current.guardrailTriggered && (
        <p class='text-[11.5px] font-semibold flex items-center gap-1.5 text-base-content/60'>
          <ShieldCheck size={14} />{' '}
          Tekki explique, il ne conseille pas : la réponse a été recadrée.
        </p>
      )}
      <FactsTable />
      <Sources />
      {current.disclaimer && (
        <p class='text-[11px] text-base-content/50'>{current.disclaimer}</p>
      )}
    </div>
  )
}

const TranscriptReview = () => {
  if (voicePhase.value !== 'review' || !transcript.value) return null
  return (
    <p class='text-[11.5px] font-semibold text-base-content/60'>
      Langue détectée : {LANGUAGE_LABELS[transcript.value.language]}
      {transcript.value.language === 'unknown' &&
        ' — choisis FR ou WO ci-dessus'}
    </p>
  )
}

const VoiceButton = () => (
  <button
    type='button'
    disabled={!voiceAvailable.value || asking.value}
    onPointerDown={() => void startListening()}
    onPointerUp={() => void stopListening()}
    onPointerLeave={() =>
      voicePhase.value === 'listening' && void stopListening()}
    onPointerCancel={cancelListening}
    aria-label='Maintenir pour parler'
    class={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 cursor-pointer select-none touch-none disabled:opacity-35 ${
      voicePhase.value === 'listening'
        ? 'bg-error text-error-content scale-110'
        : 'bg-secondary text-secondary-content'
    } transition-transform`}
  >
    {voicePhase.value === 'transcribing'
      ? <Loader2 size={20} class='animate-spin' />
      : <Mic size={20} />}
  </button>
)

const Composer = () => (
  <div class='flex flex-col gap-2'>
    {VOICE_STEPS[voicePhase.value] && (
      <p class='text-[12px] font-bold text-base-content/60'>
        {VOICE_STEPS[voicePhase.value]}
      </p>
    )}
    <TranscriptReview />
    <div class='flex items-end gap-2'>
      <VoiceButton />
      <textarea
        value={draft.value}
        onInput={(e) => setDraft((e.target as HTMLTextAreaElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            voicePhase.value === 'review' ? sendTranscript() : void ask()
          }
        }}
        rows={1}
        placeholder={voiceAvailable.value
          ? 'Écris ou maintiens le micro (wolof ou français)'
          : 'Pose ta question'}
        class='flex-1 min-h-12 max-h-28 px-3.5 py-3 rounded-2xl bg-base-200 text-[13.5px] resize-none focus:outline-none focus:ring-2 focus:ring-primary'
      />
      <button
        type='button'
        onClick={() => (voicePhase.value === 'review'
          ? sendTranscript()
          : void ask())}
        disabled={!draft.value.trim() || asking.value}
        aria-label='Envoyer'
        class='w-12 h-12 rounded-2xl bg-primary text-primary-content flex items-center justify-center flex-shrink-0 cursor-pointer disabled:opacity-35'
      >
        <Send size={18} />
      </button>
    </div>
    {!aiAvailable.value && (
      <p class='text-[11px] text-base-content/45'>
        IA non configurée : Tekki répond depuis sa base documentaire et ses
        calculs.
      </p>
    )}
  </div>
)

/** Tekki AI bottom sheet: context-aware explanations, text or voice. */
export const TekkiSheet = () =>
  isOpen.value
    ? (
      <div
        class='fixed inset-0 z-[70] flex items-end justify-center bg-black/45'
        onClick={(e) => e.target === e.currentTarget && closeTekki()}
      >
        <div class='w-full max-w-[520px] max-h-[92dvh] overflow-y-auto bg-base-200 rounded-t-[2rem] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-3.5'>
          <TekkiHeader />
          <LevelPicker />
          <AnswerCard />
          {error.value && (
            <p class='text-[12px] font-semibold text-error bg-error/10 rounded-xl px-3 py-2'>
              {error.value}
            </p>
          )}
          <Suggestions />
          <Composer />
          <p class='text-[10.5px] text-center text-base-content/40'>
            Tekki explique les données, il ne donne pas de conseil
            d’investissement. La décision t’appartient.
          </p>
        </div>
      </div>
    )
    : null
