import { user } from '../../../session/session-state.ts'

/**
 * SidebarUserProfile:
 * Profile summary card in the sidebar showing login handle, email, and guest/verified status.
 */
export const SidebarUserProfile = () => {
  const currentUser = user.value
  const displayName = currentUser?.login || 'Invité'
  const displayEmail = currentUser?.email || 'Mode Démonstration'
  const isGuest = currentUser?.isGuest !== 0

  return (
    <div class='bg-base-200 rounded-2xl p-4 flex items-center gap-3 select-none'>
      <div class='w-11 h-11 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-base flex-shrink-0'>
        {displayName.slice(0, 1).toUpperCase()}
      </div>
      <div class='flex-1 min-w-0'>
        <div class='font-bold text-sm text-base-content truncate'>
          {displayName}
        </div>
        <div class='text-xs text-base-content/60 truncate'>
          {displayEmail}
        </div>
        <div class='mt-1 inline-block bg-base-300 text-base-content/70 text-[10px] font-semibold px-2 py-0.5 rounded-full'>
          {isGuest ? 'Mode Démo' : 'Compte Vérifié'}
        </div>
      </div>
    </div>
  )
}
