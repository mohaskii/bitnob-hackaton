import type { NavTabItem } from './NavTabButton.tsx'

type SideNavLinkProps = {
  tab: NavTabItem
  isActive: boolean
  onClick: () => void
}

/**
 * SideNavLink:
 * Desktop sidebar entry. Active state is a flat primary pill, inactive entries
 * get one-step-deeper base shade on hover (no borders, no shadows).
 */
export const SideNavLink = ({ tab, isActive, onClick }: SideNavLinkProps) => {
  const Icon = tab.icon

  return (
    <button
      type='button'
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      class={`h-12 w-full rounded-full px-4 flex items-center gap-3 text-[14px] font-semibold tracking-tight cursor-pointer transition-colors duration-200 active:scale-[0.98] focus:outline-none ${
        isActive
          ? 'bg-primary text-primary-content'
          : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
      }`}
    >
      <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
      <span>{tab.label}</span>
    </button>
  )
}
