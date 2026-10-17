import { Plus } from 'lucide-preact'
import {
  composeCharCount,
  composeIsNearLimit,
  composeIsOverLimit,
  composeStrokeOffset,
  MAX_CHARS,
} from '../compose-state.ts'

/**
 * ComposeProgressMeter:
 * Circular SVG character limit progress ring and thread post adder button.
 */
export const ComposeProgressMeter = () => {
  const charCount = composeCharCount.value
  const strokeOffset = composeStrokeOffset.value
  const isNearLimit = composeIsNearLimit.value
  const isOverLimit = composeIsOverLimit.value

  return (
    <div class='flex items-center gap-2.5'>
      <div class='relative w-6 h-6 flex items-center justify-center'>
        <svg class='w-6 h-6 -rotate-90'>
          <circle
            cx='12'
            cy='12'
            r='9'
            stroke='currentColor'
            stroke-width='2'
            class='text-base-200'
            fill='none'
          />
          <circle
            cx='12'
            cy='12'
            r='9'
            stroke='currentColor'
            stroke-width='2'
            stroke-dasharray={56.54}
            stroke-dashoffset={strokeOffset}
            class={isOverLimit
              ? 'text-error'
              : isNearLimit
              ? 'text-warning'
              : 'text-primary'}
            fill='none'
            stroke-linecap='round'
          />
        </svg>
        {charCount > 240 && (
          <span
            class={`absolute text-[9px] font-bold ${
              isOverLimit ? 'text-error' : 'text-base-content/50'
            }`}
          >
            {MAX_CHARS - charCount}
          </span>
        )}
      </div>

      <div class='w-px h-5 bg-base-200'></div>

      <button
        type='button'
        title='Ajouter au fil'
        class='w-6 h-6 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center text-base-content/60 hover:text-primary active:scale-95 transition-all cursor-pointer'
      >
        <Plus size={13} strokeWidth={2.4} />
      </button>
    </div>
  )
}
