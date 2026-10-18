import { History, LogOut } from 'lucide-preact'
import { closeSidebar, handleLogoutFromSidebar } from '../../home-state.ts'
import { navigateToHistory } from '../../../transfers/transfer-state.ts'

const handleOpenHistoryFromSidebar = () => {
  closeSidebar()
  navigateToHistory()
}

/**
 * SidebarActions:
 * List of navigation/system action buttons in the sidebar drawer.
 * Contains transfer history navigation and logout button.
 */
export const SidebarActions = () => (
  <div class='flex flex-col gap-2 mt-4'>
    <button
      type='button'
      onClick={handleOpenHistoryFromSidebar}
      class='w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-base-200 hover:bg-base-300 active:scale-[0.98] text-base-content font-medium text-sm transition-all cursor-pointer'
    >
      <History size={18} class='flex-shrink-0 text-base-content/70' />
      <span>Historique des transferts</span>
    </button>

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
