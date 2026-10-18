import { BrandMark } from '../../../components/BrandMark.tsx'
import { isGuest, isLoginScreen } from '../session-state.ts'

export const RegisterHero = () => (
  <header class='relative tk-hero rounded-b-[2.5rem] px-6 pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] pb-8 lg:h-full lg:rounded-none lg:px-16 lg:py-12 lg:flex lg:flex-col lg:justify-center'>
    <div class='flex items-center justify-between lg:absolute lg:top-12'>
      <BrandMark />
    </div>

    <h1 class='mt-8 lg:mt-0 text-[32px] lg:text-[48px] leading-[1.1] font-black tracking-tight text-white lg:max-w-xl'>
      {isLoginScreen.value ? 'Se connecter à ' : 'Créer votre compte '}
      <span class='text-primary'>TekkiTrade</span>
    </h1>

    <p class='mt-3 lg:mt-6 text-[14px] lg:text-[17px] text-white/70 leading-relaxed lg:max-w-lg'>
      {isGuest.value
        ? 'Enregistrez vos identifiants pour sauvegarder définitivement votre portefeuille et vos gains.'
        : 'Investissez sur la BRVM dès 1 000 FCFA avec les rails Bitnob et l’appui des SGI régionales.'}
    </p>
  </header>
)
