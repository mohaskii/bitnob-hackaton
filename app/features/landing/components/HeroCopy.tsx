import { ArrowDown, ArrowRight } from 'lucide-preact'
import {
  landingPending,
  scrollToSection,
  startFromLanding,
} from '../landing-state.ts'

const HEADLINE = [
  ['La', 'Bourse'],
  ['d’Afrique', 'de', 'l’Ouest,'],
  ['enfin', 'à', 'votre', 'portée.'],
]

/** Hero text column. Words carry `data-hero-word` for the GSAP intro. */
export const HeroCopy = () => (
  <div data-hero-copy class='flex flex-col items-start gap-6'>
    <h1 class='text-[40px] sm:text-[52px] lg:text-[64px] leading-[1.02] font-black tracking-tight text-white'>
      {HEADLINE.map((line, i) => (
        <span key={i} class='block'>
          {line.map((word) => (
            <span key={word} class='inline-block overflow-hidden align-bottom pb-[0.06em] mr-[0.22em]'>
              <span data-hero-word class={`inline-block will-change-transform ${word === 'portée.' ? 'text-primary' : ''}`}>
                {word}
              </span>
            </span>
          ))}
        </span>
      ))}
    </h1>
    <p data-hero-fade class='max-w-md text-[16px] lg:text-[18px] leading-relaxed text-white/65'>
      Comprendre la BRVM, s’entraîner sans risque, ouvrir son compte chez une
      SGI et l’approvisionner depuis n’importe où grâce à Bitnob.
    </p>
    <div data-hero-fade class='flex flex-wrap items-center gap-3'>
      <button
        type='button'
        onClick={() => void startFromLanding()}
        disabled={landingPending.value}
        class='h-13 px-6 rounded-full bg-primary text-primary-content font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-transform disabled:opacity-60'
      >
        Commencer sans compte <ArrowRight size={18} />
      </button>
      <button
        type='button'
        onClick={() => scrollToSection('parcours')}
        class='h-13 px-6 rounded-full bg-white/10 text-white font-bold flex items-center gap-2 cursor-pointer hover:bg-white/15 transition-colors'
      >
        Voir le parcours <ArrowDown size={18} />
      </button>
    </div>
  </div>
)
