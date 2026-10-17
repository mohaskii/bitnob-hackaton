import { isGuest } from '../session-state.ts'

export const RegisterHero = () => (
  <header class='tk-hero rounded-b-[2.5rem] px-6 pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] pb-8'>
    <div class='flex items-center justify-between'>
      <div class='flex items-center gap-2'>
        <span class='w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black'>
          T
        </span>
        <span class='font-extrabold tracking-tight text-lg text-white'>
          TekkiTrade
        </span>
      </div>

    </div>

    <h1 class='mt-8 text-[32px] leading-[1.1] font-black tracking-tight text-white'>
      Créer votre compte <span class='text-primary'>TekkiTrade</span>
    </h1>

    <p class='mt-3 text-[14px] text-white/70 leading-relaxed'>
      {isGuest.value
        ? 'Enregistrez vos identifiants pour sauvegarder définitivement votre portefeuille et vos gains.'
        : 'Investissez sur la BRVM dès 1 000 FCFA avec les rails Bitnob et l’appui des SGI régionales.'}
    </p>
  </header>
)
