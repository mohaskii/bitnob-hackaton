import { LogOut } from 'lucide-preact'
import { handleLogoutFromSidebar } from '../../home-state.ts'

/**
 * SidebarActions:
 * List of navigation/system action buttons in the sidebar drawer.
 * Contains logout button connecting to /api/auth/logout.
 */
export const SidebarActions = () => (
  <div class='flex flex-col gap-2 mt-4'>
    <button
      type='button'
      onClick={handleLogoutFromSidebar}
      class='w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-error/10 hover:bg-error/20 active:scale-[0.98] text-error font-medium text-sm transition-all cursor-pointer'
    >
      <LogOut size={18} class='flex-shrink-0' />
      <span>Déconnexion</span>
    </button>
  </div>
)
