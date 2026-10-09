import { ComposeReplyRestriction } from './ComposeReplyRestriction.tsx'
import { ComposeMediaActions } from './ComposeMediaActions.tsx'
import { ComposeProgressMeter } from './ComposeProgressMeter.tsx'

/**
 * ComposeToolbar:
 * Thin orchestrator for compose bottom controls (Rule 5: Decomposition Discipline).
 */
export const ComposeToolbar = () => {
  return (
    <footer class='flex flex-col px-4 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] pt-1 bg-base-100 border-t border-base-200'>
      <ComposeReplyRestriction />
      <div class='h-px bg-base-200 my-1'></div>
      <div class='flex items-center justify-between py-1.5'>
        <ComposeMediaActions />
        <ComposeProgressMeter />
      </div>
    </footer>
  )
}
