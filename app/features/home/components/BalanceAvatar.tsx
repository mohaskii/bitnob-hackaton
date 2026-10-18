import { HomeMenuButton } from './HomeMenuButton.tsx'

type BalanceAvatarProps = {
  avatarUrl?: string
  onClick?: () => void
}

/**
 * BalanceAvatar:
 * Kept for backwards compatibility, renders HomeMenuButton with menu SVG icon.
 */
export const BalanceAvatar = ({ onClick }: BalanceAvatarProps) => (
  <HomeMenuButton onClick={onClick} />
)
