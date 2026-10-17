import { BrandMark } from '../../../components/BrandMark.tsx'

export const WelcomeHero = () => (
  <header class='relative tk-hero rounded-b-[2.5rem] px-6 pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] pb-10 lg:w-1/2 lg:flex-shrink-0 lg:rounded-none lg:px-16 lg:py-12 lg:flex lg:flex-col lg:justify-center'>
    <div class='lg:absolute lg:top-12'>
      <BrandMark />
    </div>
    <h1 class='mt-10 lg:mt-0 text-[34px] lg:text-[52px] leading-[1.05] font-black tracking-tight text-white lg:max-w-xl'>
      Votre première action <span class='text-primary'>BRVM</span>, étape par étape.
    </h1>
    <p class='mt-4 lg:mt-6 text-[15px] lg:text-[17px] text-white/65 leading-relaxed lg:max-w-lg'>
      De la curiosité au compte-titres chez une SGI agréée, avec un parcours
      clair, des coûts visibles et un entraînement sans argent réel.
    </p>
  </header>
)
