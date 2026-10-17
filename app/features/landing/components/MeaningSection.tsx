import { MEANING_WORDS } from '../landing-content.ts'

/** Chapter 1 — what "Tekki" means. Words light up as you scroll. */
export const MeaningSection = () => (
  <section data-meaning class='mx-auto max-w-5xl px-5 lg:px-8 py-24 lg:py-40'>
    <p class='text-[12px] font-bold uppercase tracking-wider text-base-content/45 mb-6'>
      Pourquoi « Tekki »
    </p>
    <p class='text-[28px] sm:text-[38px] lg:text-[52px] leading-[1.15] font-black tracking-tight'>
      {MEANING_WORDS.map((word, i) => (
        <span
          key={i}
          data-meaning-word
          class={`inline-block mr-[0.25em] ${
            word.includes('Tekki') ? 'bg-primary rounded-xl px-[0.15em]' : ''
          }`}
        >
          {word}
        </span>
      ))}
    </p>
  </section>
)
