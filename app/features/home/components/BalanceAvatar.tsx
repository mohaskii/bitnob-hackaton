import { isGuest } from '../../session/session-state.ts'

type BalanceAvatarProps = {
  avatarUrl?: string
  onClick?: () => void
}

/**
 * BalanceAvatar:
 * Top-right profile avatar target embedded in safe-area.
 */
export const BalanceAvatar = ({ avatarUrl, onClick }: BalanceAvatarProps) => {
  if (!avatarUrl) return null

  return (
    <div class='absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5 z-20 flex items-center gap-2'>
      {isGuest.value && (
        <button
          type='button'
          onClick={onClick}
          class='text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-content px-2.5 py-1 rounded-full cursor-pointer hover:opacity-90 active:scale-95 transition-all'
        >
          S'inscrire
        </button>
      )}
      <div
        onClick={onClick}
        title={isGuest.value ? 'Mode invité - Cliquez pour créer un compte' : 'Mon compte'}
        class='w-9 h-9 rounded-full bg-neutral-content/20 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform'
      >

        <img
          src={avatarUrl}
          alt='Profil'
          class='w-full h-full object-cover'
        />
      </div>
    </div>
  )
}

