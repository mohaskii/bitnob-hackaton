import { Home } from 'lucide-preact'

export type NavTabItem = {
  id: string
  label: string
  path: string
  icon: typeof Home
}

type NavTabButtonProps = {
  tab: NavTabItem
  isActive: boolean
  onClick: () => void
}

/**
 * NavTabButton:
 * Individual floating pill tab button with 0.3s cubic-bezier width expansion.
 */
export const NavTabButton = ({
  tab,
  isActive,
  onClick,
}: NavTabButtonProps) => {
  const Icon = tab.icon

  return (
    <button
      type='button'
      onClick={onClick}
      class={`relative h-13 rounded-full flex items-center justify-center cursor-pointer transition-[width,background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] focus:outline-none overflow-hidden ${
        isActive
          ? 'w-[108px] bg-primary text-primary-content'
          : 'w-13 text-base-content/50 rounded-full'
      }`}
    >
      <div
        class={`w-6 h-6 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isActive ? 'scale-105' : 'scale-100'
        }`}
      >
        <Icon
          size={20}
          strokeWidth={isActive ? 2.4 : 1.9}
        />
      </div>

      <span
        class={`text-[13.5px] font-semibold tracking-tight whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin-left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isActive
            ? 'max-w-[68px] opacity-100 ml-1.5'
            : 'max-w-0 opacity-0 ml-0'
        }`}
      >
        {tab.label}
      </span>
    </button>
  )
}
