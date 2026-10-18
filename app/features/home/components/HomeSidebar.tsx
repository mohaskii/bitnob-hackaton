import { closeSidebar, isSidebarOpen } from '../home-state.ts'
import { SidebarHeader } from './sidebar/SidebarHeader.tsx'
import { SidebarUserProfile } from './sidebar/SidebarUserProfile.tsx'
import { SidebarActions } from './sidebar/SidebarActions.tsx'
import { SidebarFooter } from './sidebar/SidebarFooter.tsx'

/**
 * HomeSidebar:
 * Thin assembler orchestrating the slide-in drawer from the right.
 * Only re-renders when isSidebarOpen changes.
 * Pure flat design: zero shadows, zero borders, pure bg-base contrast.
 */
export const HomeSidebar = () => {
  if (!isSidebarOpen.value) return null

  return (
    <div class='fixed inset-0 z-50 overflow-hidden select-none'>
      {/* Backdrop overlay */}
      <div
        onClick={closeSidebar}
        class='absolute inset-0 bg-black/60 transition-opacity'
        aria-hidden='true'
      />

      {/* Slide-out drawer panel */}
      <div class='absolute inset-y-0 right-0 w-72 sm:w-80 bg-base-100 flex flex-col p-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] z-10 transition-transform'>
        <SidebarHeader />
        <div class='flex-1 flex flex-col mt-2'>
          <SidebarUserProfile />
          <SidebarActions />
          <SidebarFooter />
        </div>
      </div>
    </div>
  )
}
