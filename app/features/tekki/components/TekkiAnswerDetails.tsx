import { ExternalLink } from 'lucide-preact'
import type { TekkiAnswer } from '../tekki-api.ts'

const PointTag = ({ type }: { type: 'FACT' | 'INTERPRETATION' }) => (
  <span
    class={`text-[9.5px] font-black uppercase tracking-wide rounded-md px-1.5 py-0.5 mr-1.5 ${
      type === 'FACT' ? 'bg-base-300/70' : 'bg-primary text-primary-content'
    }`}
  >
    {type === 'FACT' ? 'Fait' : 'Lecture'}
  </span>
)

const AnswerPoints = ({ answer }: { answer: TekkiAnswer }) =>
  answer.points.length === 0 ? null : (
    <ul class='flex flex-col gap-1.5'>
      {answer.points.map((p) => (
        <li key={p.text} class='text-[12.5px] leading-relaxed'>
          <PointTag type={p.type} />
          {p.text}
        </li>
      ))}
    </ul>
  )

const FactsList = ({ answer }: { answer: TekkiAnswer }) =>
  answer.facts.length === 0
    ? null
    : (
      <div class='rounded-2xl bg-base-200/80 px-3 py-2.5'>
        <p class='text-[10px] font-black uppercase tracking-wide text-base-content/45 mb-1.5'>
          Données calculées par TekkiTrade
        </p>
        <dl class='flex flex-col divide-y divide-base-300/60'>
          {answer.facts.map((f) => (
            <div
              key={f.label}
              class='flex justify-between gap-3 py-1.5 text-[11.5px]'
            >
              <dt class='text-base-content/55'>{f.label}</dt>
              <dd class='font-bold text-right'>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    )

const SourcesList = ({ answer }: { answer: TekkiAnswer }) =>
  answer.sources.length === 0 ? null : (
    <div class='flex flex-wrap gap-1.5'>
      {answer.sources.map((s) =>
        s.url
          ? (
            <a
              key={s.id}
              href={s.url}
              target='_blank'
              rel='noreferrer'
              class='h-7 px-2.5 rounded-full bg-base-200 text-[11px] font-bold inline-flex items-center gap-1'
            >
              {s.source} <ExternalLink size={11} />
            </a>
          )
          : (
            <span
              key={s.id}
              class='h-7 px-2.5 rounded-full bg-base-200 text-[11px] font-bold inline-flex items-center'
            >
              {s.source}
            </span>
          )
      )}
    </div>
  )

/** What the answer rests on: points, computed facts, sources. */
export const TekkiAnswerDetails = ({ answer }: { answer: TekkiAnswer }) => (
  <div class='flex flex-col gap-2.5 pt-1 animate-bubble-in'>
    <AnswerPoints answer={answer} />
    <FactsList answer={answer} />
    <SourcesList answer={answer} />
    {answer.disclaimer && (
      <p class='text-[10.5px] leading-snug text-base-content/50'>
        {answer.disclaimer}
      </p>
    )}
  </div>
)
