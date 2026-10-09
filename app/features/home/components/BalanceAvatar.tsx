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
    <div class='absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5 z-20'>
      <div
        onClick={onClick}
        class='w-9 h-9 rounded-full bg-neutral-content/10 ring-1 ring-white/15 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform'
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
