import type { ComponentChildren } from 'preact'
import { HelpCircle, Lightbulb } from 'lucide-preact'
import { Sheet } from '../../components/ui.tsx'
import { GLOSSARY } from './glossary.ts'
import { closeExplainer, explain, openTerm } from './explainer-state.ts'

/** Inline "?" chip next to a word; opens a short explanation. */
export const ExplainChip = (
  { term, children }: { term: string; children?: ComponentChildren },
) => (
  <button
    type='button'
    onClick={(e) => {
      e.stopPropagation()
      explain(term)
    }}
    class='inline-flex items-center gap-1 text-[11px] font-semibold text-base-content/55 hover:text-base-content cursor-pointer'
  >
    {children ?? GLOSSARY[term]?.title}
    <HelpCircle size={13} />
  </button>
)

/** A one-line tip card that expands into the explanation sheet. */
export const TipCard = ({ term }: { term: string }) => (
  <button
    type='button'
    onClick={() => explain(term)}
    class='w-full flex items-start gap-3 bg-primary/15 rounded-2xl px-3.5 py-3 text-left cursor-pointer active:scale-[0.99] transition-transform'
  >
    <span class='w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0'>
      <Lightbulb size={16} />
    </span>
    <span class='min-w-0'>
      <span class='block text-[13px] font-bold'>{GLOSSARY[term]?.title}</span>
      <span class='block text-[12px] text-base-content/65 mt-0.5'>
        {GLOSSARY[term]?.short}
      </span>
    </span>
  </button>
)

export const ExplainerSheet = () => {
  const term = openTerm.value
  return (
    <Sheet
      open={term !== null}
      onClose={closeExplainer}
      title={<p class='text-base font-extrabold'>{term?.title}</p>}
    >
      <p class='text-[14px] font-semibold'>{term?.short}</p>
      {term?.body.map((paragraph) => (
        <p
          key={paragraph}
          class='text-[13px] leading-relaxed text-base-content/75'
        >
          {paragraph}
        </p>
      ))}
      <div class='h-2' />
    </Sheet>
  )
}
