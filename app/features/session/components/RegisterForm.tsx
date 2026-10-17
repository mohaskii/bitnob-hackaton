import { InlineError, PrimaryButton } from '../../../components/ui.tsx'
import {
  authEmail,
  authError,
  authLogin,
  authPassword,
  authPending,
  goToLogin,
  setAuthEmail,
  setAuthLogin,
  setAuthPassword,
  submitRegister,
} from '../session-state.ts'

export const RegisterForm = () => (
  <form
    class='flex flex-col gap-3.5'
    onSubmit={(e) => {
      e.preventDefault()
      void submitRegister()
    }}
  >
    <div class='flex flex-col gap-1'>
      <label class='text-[12px] font-bold text-base-content/70 px-1'>
        Adresse email
      </label>
      <input
        type='email'
        value={authEmail.value}
        onInput={(e) => setAuthEmail((e.target as HTMLInputElement).value)}
        placeholder='nom@exemple.com'
        autoComplete='email'
        required
        class='h-13 px-4 rounded-2xl bg-base-200 text-sm focus:outline-none focus:bg-base-300 transition-colors'
      />
    </div>

    <div class='flex flex-col gap-1'>
      <label class='text-[12px] font-bold text-base-content/70 px-1'>
        Pseudo d'investisseur
      </label>
      <input
        type='text'
        value={authLogin.value}
        onInput={(e) => setAuthLogin((e.target as HTMLInputElement).value)}
        placeholder='ex: Moussa_Invest'
        autoComplete='username'
        required
        class='h-13 px-4 rounded-2xl bg-base-200 text-sm focus:outline-none focus:bg-base-300 transition-colors'
      />
    </div>

    <div class='flex flex-col gap-1'>
      <label class='text-[12px] font-bold text-base-content/70 px-1'>
        Mot de passe
      </label>
      <input
        type='password'
        value={authPassword.value}
        onInput={(e) => setAuthPassword((e.target as HTMLInputElement).value)}
        placeholder='8 caractères minimum'
        autoComplete='new-password'
        required
        class='h-13 px-4 rounded-2xl bg-base-200 text-sm focus:outline-none focus:bg-base-300 transition-colors'
      />
    </div>

    <InlineError message={authError.value} />

    <PrimaryButton onClick={() => void submitRegister()} pending={authPending.value}>
      Créer mon compte
    </PrimaryButton>

    <div class='flex flex-col items-center gap-2 pt-2'>
      <button
        type='button'
        onClick={goToLogin}
        class='text-[13px] font-semibold text-base-content/70 hover:text-base-content cursor-pointer'
      >
        Vous avez déjà un compte ?{' '}
        <span class='font-bold text-primary-content underline'>Se connecter</span>
      </button>
    </div>
  </form>
)

