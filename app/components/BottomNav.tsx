import { Home, PieChart, TrendingUp, Users } from 'lucide-preact'
import { navigate, url } from '../router.tsx'

export interface NavTabItem {
  id: string
  label: string
  path: string
  icon: typeof Home
}

export const DEFAULT_TABS: NavTabItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: Home },
  { id: 'market', label: 'Market', path: '/market', icon: TrendingUp },
  { id: 'social', label: 'Social', path: '/social', icon: Users },
  { id: 'portfolio', label: 'Portfolio', path: '/portfolio', icon: PieChart },
]

interface BottomNavProps {
  activeTab?: string
  tabs?: NavTabItem[]
  onTabChange?: (tab: NavTabItem) => void
}

/**
 * BottomNav Component:
 * - Floating pill navigation inspired by the reference design.
 * - Smart fixed-width geometry: The global component width is locked (constant 300px)
 *   and each active tab expands into a standardized fixed slot (70px label).
 *   This prevents any jitter, jumping, or resizing of the global bar regardless of label length.
 * - Subtle, high-framerate transitions powered by cubic-bezier easing.
 * - Uses DaisyUI / style.css theme tokens (primary, primary-content, base-100, base-300).
 */
export const BottomNav = ({
  activeTab,
  tabs = DEFAULT_TABS,
  onTabChange,
}: BottomNavProps) => {
  const currentPath = activeTab ?? (url.path || '/')

  const handleTabClick = (tab: NavTabItem) => {
    if (onTabChange) {
      onTabChange(tab)
    }
    navigate({ href: tab.path })
  }

  return (
    <div class='fixed bottom-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] inset-x-0 flex justify-center z-50 pointer-events-none select-none px-4'>
      <nav
        aria-label='Bottom Navigation'
        class='pointer-events-auto w-full max-w-[360px] bg-base-100/90 backdrop-blur-xl rounded-full p-2 flex items-center justify-between gap-1.5'
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.path === '/'
            ? currentPath === '/' || currentPath === ''
            : currentPath === tab.path || currentPath.startsWith(tab.path + '/')

          return (
            <button
              key={tab.id}
              type='button'
              onClick={() => handleTabClick(tab)}
              class={`relative h-15 rounded-full flex items-center justify-center cursor-pointer transition-[width,background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] focus:outline-none overflow-hidden ${
                isActive
                  ? 'w-[110px] bg-primary text-primary-content'
                  : 'w-15 text-base-content/50 rounded-full bg-base-200'
              }`}
            >
              {/* Icon Container with subtle micro-scale feedback */}
              <div
                class={`w-6 h-6 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.4 : 1.9}
                />
              </div>

              {/* Fixed-width text slot: Always expands to 78px when active, collapses to 0 when inactive.
                  This guarantees the total active item width is identical across all tabs */}
              <span
                class={`text-[13.5px] font-semibold tracking-tight whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin-left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive
                    ? 'max-w-[70px] opacity-100 ml-2'
                    : 'max-w-0 opacity-0 ml-0'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
