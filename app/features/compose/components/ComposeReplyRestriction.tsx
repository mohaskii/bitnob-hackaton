import { Globe } from 'lucide-preact'
import {
  composeReplyRestriction,
  toggleComposeReplyRestriction,
} from '../compose-state.ts'

/**
 * ComposeReplyRestriction:
 * Interactive button to toggle who can reply to the post (Public / Communauté).
 */
export const ComposeReplyRestriction = () => {
  const restriction = composeReplyRestriction.value

  return (
    <div class='py-2'>
      <button
        type='button'
        onClick={toggleComposeReplyRestriction}
        class='inline-flex items-center gap-1.5 text-xs font-semibold text-base-content/70 hover:text-base-content cursor-pointer transition-colors'
      >
        <Globe size={13} strokeWidth={2.2} class='text-primary' />
        <span>{restriction}</span>
      </button>
    </div>
  )
}
