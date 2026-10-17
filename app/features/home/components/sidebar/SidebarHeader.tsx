import { X } from 'lucide-preact'
import { closeSidebar } from '../../home-state.ts'

/**
 * SidebarHeader:
 * Top bar of the sidebar drawer with TekkiTrade branding and close button.
 */
export const SidebarHeader = () => (
  <div class='flex items-center justify-between pb-4'>
    <div class='flex items-center gap-2'>
      <span class='w-8 h-8 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black text-sm'>
        T
      </span>
      <span class='font-bold text-base tracking-tight text-base-content'>
        TekkiTrade
      </span>
    </div>
    <button
      type='button'
      onClick={closeSidebar}
      aria-label='Fermer le menu'
      class='w-9 h-9 rounded-full bg-base-200 hover:bg-base-300 active:scale-95 text-base-content flex items-center justify-center transition-all cursor-pointer'
    >
      <X size={18} />
    </button>
  </div>
)
