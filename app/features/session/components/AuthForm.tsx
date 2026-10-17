import { InlineError, PrimaryButton } from '../../../components/ui.tsx'
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
  submitAuth,
} from '../session-state.ts'

export const AuthForm = () => {
  const isRegister = authMode.value === 'register'

  return (
    <form
      class='flex flex-col gap-3 bg-base-100 rounded-3xl p-5'
      onSubmit={(e) => {
        e.preventDefault()
        void submitAuth()
      }}
    >
      <input
        type='email'
        value={authEmail.value}
        onInput={(e) => setAuthEmail((e.target as HTMLInputElement).value)}
        placeholder='Email'
        required
        class='h-13 px-4 rounded-2xl bg-base-200 text-sm focus:outline-none focus:bg-base-300 transition-colors'
      />
      {isRegister && (
        <input
          type='text'
          value={authLogin.value}
          onInput={(e) => setAuthLogin((e.target as HTMLInputElement).value)}
          placeholder='Pseudo'
          required
          class='h-13 px-4 rounded-2xl bg-base-200 text-sm focus:outline-none focus:bg-base-300 transition-colors'
        />
      )}
      <input
        type='password'
        value={authPassword.value}
        onInput={(e) => setAuthPassword((e.target as HTMLInputElement).value)}
        placeholder='Mot de passe (8 caractères min.)'
        required
        class='h-13 px-4 rounded-2xl bg-base-200 text-sm focus:outline-none focus:bg-base-300 transition-colors'
      />
      <InlineError message={authError.value} />
      <PrimaryButton onClick={() => void submitAuth()} pending={authPending.value}>
        {isRegister ? 'Créer mon compte' : 'Se connecter'}
      </PrimaryButton>
      <div class='flex items-center justify-between pt-1 px-1'>
        <button
          type='button'
          onClick={() => setAuthMode(isRegister ? 'login' : 'register')}
          class='text-[13px] font-semibold text-base-content/70 hover:text-base-content cursor-pointer'
        >
          {isRegister ? 'J’ai déjà un compte' : 'Créer un compte'}
        </button>
        <button
          type='button'
          onClick={() => setAuthMode('welcome')}
          class='text-[13px] font-semibold text-base-content/50 hover:text-base-content cursor-pointer'
        >
          Retour
        </button>
      </div>
    </form>
  )
}

