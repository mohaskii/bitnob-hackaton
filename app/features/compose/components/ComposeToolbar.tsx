import {
  BarChart2,
  Camera,
  Globe,
  Image,
  MapPin,
  Plus,
  Tag,
} from 'lucide-preact'
import {
  composeCharCount,
  composeIsNearLimit,
  composeIsOverLimit,
  composeReplyRestriction,
  composeSelectedSymbol,
  composeShowAssetPicker,
  composeStrokeOffset,
  MAX_CHARS,
  toggleComposeAssetPicker,
  toggleComposeReplyRestriction,
} from '../compose-state.ts'

export const ComposeToolbar = () => {
  const restriction = composeReplyRestriction.value
  const showPicker = composeShowAssetPicker.value ||
    composeSelectedSymbol.value !== null
  const charCount = composeCharCount.value
  const strokeOffset = composeStrokeOffset.value
  const isNearLimit = composeIsNearLimit.value
  const isOverLimit = composeIsOverLimit.value

  return (
    <footer class='flex flex-col px-4 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] pt-1 bg-base-100 border-t border-base-200'>
      {/* Reply Restriction Row */}
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

      {/* Separator Line */}
      <div class='h-px bg-base-200 my-1'></div>

      {/* Icon Action Toolbar */}
      <div class='flex items-center justify-between py-1.5'>
        <div class='flex items-center gap-2 sm:gap-3 text-base-content/60'>
          <button
            type='button'
            title='Media'
            class='p-1.5 hover:text-primary hover:bg-base-200 rounded-lg active:scale-95 transition-all cursor-pointer'
          >
            <Image size={19} strokeWidth={2} />
          </button>
          <button
            type='button'
            title='Photo'
            class='p-1.5 hover:text-primary hover:bg-base-200 rounded-lg active:scale-95 transition-all cursor-pointer'
          >
            <Camera size={19} strokeWidth={2} />
          </button>
          <button
            type='button'
            title='Sondage / Stats'
            class='p-1.5 hover:text-primary hover:bg-base-200 rounded-lg active:scale-95 transition-all cursor-pointer'
          >
            <BarChart2 size={19} strokeWidth={2} />
          </button>
          <button
            type='button'
            title='Taguer un actif BRVM'
            onClick={toggleComposeAssetPicker}
            class={`p-1.5 active:scale-95 rounded-lg transition-all cursor-pointer ${
              showPicker
                ? 'text-primary bg-primary/10 font-bold'
                : 'hover:text-primary hover:bg-base-200'
            }`}
          >
            <Tag size={19} strokeWidth={2} />
          </button>
          <button
            type='button'
            title='Localisation'
            class='p-1.5 hover:text-primary hover:bg-base-200 rounded-lg active:scale-95 transition-all cursor-pointer'
          >
            <MapPin size={19} strokeWidth={2} />
          </button>
        </div>

        {/* Circular Progress Meter + Thread Add */}
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
            class='w-6 h-6 rounded-full border border-base-300 flex items-center justify-center text-base-content/60 hover:text-primary hover:border-primary active:scale-95 transition-all cursor-pointer'
          >
            <Plus size={13} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </footer>
  )
}
