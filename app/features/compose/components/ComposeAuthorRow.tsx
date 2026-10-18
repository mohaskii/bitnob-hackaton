import { ChevronDown } from 'lucide-preact'
import { user } from '../../session/session-state.ts'
import { composeAudience, toggleComposeAudience } from '../compose-state.ts'

export const ComposeAuthorRow = () => {
  const audience = composeAudience.value
  const currentUser = user.value
  const displayName = currentUser?.login || 'Investisseur'

  return (
    <div class='flex items-center gap-3 select-none'>
      <div class='w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0'>
        {displayName.slice(0, 1).toUpperCase()}
      </div>
      <div class='flex items-center gap-2'>
        <span class='font-bold text-sm text-base-content'>
          {displayName}
        </span>
        <button
          type='button'
          onClick={toggleComposeAudience}
          class='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-base-200 text-base-content/75 text-[11px] font-semibold hover:bg-base-300 active:scale-95 transition-all cursor-pointer'
        >
          <span>{audience}</span>
          <ChevronDown size={11} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
