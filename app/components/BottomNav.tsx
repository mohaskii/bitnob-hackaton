import { Building2, Home, PieChart, Send, TrendingUp } from 'lucide-preact'
import { navigate, url } from '../router.tsx'
import { NavTabButton, NavTabItem } from './NavTabButton.tsx'

export type { NavTabItem }

export const DEFAULT_TABS: NavTabItem[] = [
  { id: 'home', label: 'Accueil', path: '/', icon: Home },
  { id: 'market', label: 'Marché', path: '/market', icon: TrendingUp },
  { id: 'portfolio', label: 'Pratique', path: '/portfolio', icon: PieChart },
  { id: 'journey', label: 'Compte', path: '/journey', icon: Building2 },
  { id: 'fund', label: 'Financer', path: '/fund', icon: Send },
]

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
      class={`fixed bottom-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] inset-x-0 flex justify-center z-50 pointer-events-none select-none px-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden
          ? 'translate-y-36 opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <nav
        aria-label='Navigation principale'
        class='pointer-events-auto w-full max-w-[372px] bg-base-100/85 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl rounded-full p-1.5 flex items-center justify-between gap-1'
      >
        {tabs.map((tab) => {
          const isActive = tab.path === '/'
            ? currentPath === '/' || currentPath === ''
            : currentPath === tab.path || currentPath.startsWith(tab.path + '/')

          return (
            <NavTabButton
              key={tab.id}
              tab={tab}
              isActive={isActive}
              onClick={() => handleTabClick(tab)}
            />
          )
        })}
      </nav>
    </div>
  )
}
