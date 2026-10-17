import { BrandMark } from '../../../components/BrandMark.tsx'
import { DISCLAIMER } from '../landing-content.ts'

export const LandingFooter = () => (
  <footer class='mx-auto max-w-6xl px-5 lg:px-8 py-14 flex flex-col gap-6'>
    <BrandMark tone='base' />
    <p class='max-w-3xl text-[12.5px] leading-relaxed text-base-content/50'>
      {DISCLAIMER}
    </p>
    <p class='text-[12px] text-base-content/40'>
      Chiffres de marché : BRVM, communiqué d’août 2026. Cours différés publiés
      sur brvm.org. Paiements : Bitnob.
    </p>
  </footer>
)
