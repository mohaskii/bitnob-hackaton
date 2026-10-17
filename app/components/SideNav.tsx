import { SquarePen } from 'lucide-preact'
import { navigateUrl } from '../router.tsx'
import { DEFAULT_TABS, isTabActive } from './BottomNav.tsx'
import { BrandMark } from './BrandMark.tsx'
import { SideNavLink } from './SideNavLink.tsx'
import { openCompose } from '../features/social/social-state.ts'

/** The composer lives on the social feed: go there, then open it. */
const openComposeFromNav = () => {
  navigateUrl('/social')
  openCompose()
}

type SideNavProps = {
  activeTab: string
  hidden?: boolean
}

/**
 * SideNav:
 * Desktop (lg+) navigation rail replacing the floating BottomNav.
 * Flat bg-base-100 column contrasted against the bg-base-200 canvas.
 */
export const SideNav = ({ activeTab, hidden = false }: SideNavProps) => (
  <aside
    class={`${
      hidden ? 'hidden' : 'hidden lg:flex'
    } w-[248px] flex-shrink-0 h-full flex-col bg-base-100 px-4 py-6 gap-8 select-none`}
  >
    <div class='px-2'>
      <BrandMark tone='base' />
    </div>

    <nav aria-label='Navigation principale' class='flex flex-col gap-1.5'>
      {DEFAULT_TABS.map((tab) => (
        <SideNavLink
          key={tab.id}
          tab={tab}
          isActive={isTabActive(tab, activeTab)}
          onClick={() => navigateUrl(tab.path)}
        />
      ))}
    </nav>

    <button
      type='button'
      onClick={openComposeFromNav}
      class='mt-auto h-12 w-full rounded-full bg-neutral text-neutral-content flex items-center justify-center gap-2 text-[14px] font-bold cursor-pointer active:scale-[0.98] transition-transform'
    >
      <SquarePen size={18} strokeWidth={2.2} />
      Publier
    </button>
  </aside>
)
