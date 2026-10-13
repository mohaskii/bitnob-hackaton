import {
  ArrowRight,
  Building2,
  GraduationCap,
  Send,
  ShieldCheck,
} from 'lucide-preact'
import { InlineError, PrimaryButton } from '../../components/ui.tsx'
import {
  authEmail,
  authError,
  authLogin,
  authMode,
  authPassword,
  authPending,
  setAuthEmail,
  setAuthLogin,
  setAuthMode,
  setAuthPassword,
  startAsGuest,
  submitAuth,
} from './session-state.ts'

const PROMISES = [
  {
    icon: GraduationCap,
    title: 'Comprendre avant d’investir',
    text: 'Cours BRVM sourcés, frais détaillés, mots expliqués au bon moment.',
  },
  {
    icon: ShieldCheck,
    title: 'S’entraîner sans risque',
    text: '1 000 000 FCFA fictifs, aux vrais cours différés de la BRVM.',
  },
  {
    icon: Building2,
    title: 'Ouvrir son compte chez une SGI',
    text: 'Comparez, préparez vos pièces et suivez votre dossier.',
  },
  {
    icon: Send,
    title: 'Approvisionner depuis partout',
    text: 'USDT, USDC ou Bitcoin via Bitnob : votre SGI reçoit des FCFA.',
  },
]

const WelcomeHero = () => (
  <div class='tk-hero rounded-b-[2.5rem] px-6 pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] pb-10'>
    <div class='flex items-center gap-2'>
      <span class='w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black'>
        T
      </span>
      <span class='font-extrabold tracking-tight text-lg'>TekkiTrade</span>
    </div>
    <h1 class='mt-10 text-[34px] leading-[1.05] font-black tracking-tight'>
      Votre première action{' '}
      <span class='text-primary'>BRVM</span>, étape par étape.
    </h1>
    <p class='mt-4 text-[15px] text-white/65 leading-relaxed'>
      De la curiosité au compte-titres chez une SGI agréée, avec un parcours
      clair, des coûts visibles et un entraînement sans argent réel.
    </p>
  </div>
)

const PromiseList = () => (
  <div class='flex flex-col gap-3'>
    {PROMISES.map(({ icon: Icon, title, text }) => (
      <div
        key={title}
        class='flex items-start gap-3 bg-base-100 rounded-2xl p-3.5'
      >
        <span class='w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0'>
          <Icon size={19} />
        </span>
        <span>
          <span class='block text-[14px] font-bold'>{title}</span>
          <span class='block text-[12.5px] text-base-content/60 mt-0.5'>
            {text}
          </span>
        </span>
      </div>
    ))}
  </div>
)

const AuthForm = () => (
  <div class='flex flex-col gap-3'>
    <input
      type='email'
      value={authEmail.value}
      onInput={(e) => setAuthEmail((e.target as HTMLInputElement).value)}
      placeholder='Email'
      class='h-13 px-4 rounded-2xl bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
    />
    {authMode.value === 'register' && (
      <input
        type='text'
        value={authLogin.value}
        onInput={(e) => setAuthLogin((e.target as HTMLInputElement).value)}
        placeholder='Pseudo'
        class='h-13 px-4 rounded-2xl bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
      />
    )}
    <input
      type='password'
      value={authPassword.value}
      onInput={(e) => setAuthPassword((e.target as HTMLInputElement).value)}
      onKeyDown={(e) => e.key === 'Enter' && void submitAuth()}
      placeholder='Mot de passe (8 caractères min.)'
      class='h-13 px-4 rounded-2xl bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
    />
    <InlineError message={authError.value} />
    <PrimaryButton
      onClick={() => void submitAuth()}
      pending={authPending.value}
    >
      {authMode.value === 'register' ? 'Créer mon compte' : 'Se connecter'}
    </PrimaryButton>
    <button
      type='button'
      onClick={() =>
        setAuthMode(authMode.value === 'register' ? 'login' : 'register')}
      class='text-[13px] font-semibold text-base-content/60 cursor-pointer py-1'
    >
      {authMode.value === 'register'
        ? 'J’ai déjà un compte'
        : 'Créer un compte'}
    </button>
    <button
      type='button'
      onClick={() => setAuthMode('welcome')}
      class='text-[13px] font-semibold text-base-content/40 cursor-pointer'
    >
      Retour
    </button>
  </div>
)

const WelcomeActions = () => (
  <div class='flex flex-col gap-3'>
    <InlineError message={authError.value} />
    <PrimaryButton
      onClick={() => void startAsGuest()}
      pending={authPending.value}
    >
      Commencer sans compte <ArrowRight size={18} />
    </PrimaryButton>
    <PrimaryButton tone='ghost' onClick={() => setAuthMode('login')}>
      J’ai déjà un compte
    </PrimaryButton>
  </div>
)

export const WelcomeScreen = () => (
  <div class='min-h-full flex flex-col bg-base-200 overflow-y-auto'>
    <WelcomeHero />
    <div class='flex-1 px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] flex flex-col gap-6 max-w-[480px] w-full mx-auto'>
      {authMode.value === 'welcome' ? <PromiseList /> : null}
      {authMode.value === 'welcome' ? <WelcomeActions /> : <AuthForm />}
      <p class='text-[11px] text-base-content/45 text-center leading-relaxed'>
        TekkiTrade fournit de l’information et de l’entraînement, pas de conseil
        en investissement. Les ordres réels sont exécutés par des SGI agréées
        par l’AMF-UMOA.
      </p>
    </div>
  </div>
)
