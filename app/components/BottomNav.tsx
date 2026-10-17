import { Home, PieChart, TrendingUp, Users } from 'lucide-preact'
import { navigate, url } from '../router.tsx'
import { NavTabButton, NavTabItem } from './NavTabButton.tsx'

export type { NavTabItem }

export const DEFAULT_TABS: NavTabItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: Home },
  { id: 'market', label: 'Market', path: '/market', icon: TrendingUp },
  { id: 'social', label: 'Social', path: '/social', icon: Users },
  { id: 'portfolio', label: 'Portfolio', path: '/portfolio', icon: PieChart },
]

/** Root tab matches `/` and `''`; others also match their nested sub-paths. */
export const isTabActive = (tab: NavTabItem, currentPath: string) =>
  tab.path === '/'
    ? currentPath === '/' || currentPath === ''
    : currentPath === tab.path || currentPath.startsWith(tab.path + '/')

type BottomNavProps = {
  activeTab?: string
  tabs?: NavTabItem[]
  onTabChange?: (tab: NavTabItem) => void
  hidden?: boolean
}

/**
 * BottomNav Component:
 * - Floating pill navigation orchestrator (Rule 5: Decomposition Discipline).
 * - Fixed geometry: Constant width container with standardized active pill expansion.
 */
export const BottomNav = ({
  activeTab,
  tabs = DEFAULT_TABS,
  onTabChange,
  hidden = false,
}: BottomNavProps) => {
  const currentPath = activeTab ?? (url.path || '/')

  const handleTabClick = (tab: NavTabItem) => {
    if (onTabChange) onTabChange(tab)
    navigate({ href: tab.path })
  }

  return (
    <div
      class={`lg:hidden fixed bottom-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] inset-x-0 flex justify-center z-50 pointer-events-none select-none px-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden
          ? 'translate-y-36 opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <nav
        aria-label='Bottom Navigation'
        class='pointer-events-auto w-full max-w-[360px] bg-secondary/10 backdrop-blur rounded-full p-2 flex items-center justify-between gap-1.5'
      >
        {tabs.map((tab) => (
          <NavTabButton
            key={tab.id}
            tab={tab}
            isActive={isTabActive(tab, currentPath)}
            onClick={() => handleTabClick(tab)}
          />
        ))}
      </nav>
    </div>
  )
}
