import { BarChart2, Camera, Image, MapPin, Tag } from 'lucide-preact'
import {
  composeSelectedSymbol,
  composeShowAssetPicker,
  toggleComposeAssetPicker,
} from '../compose-state.ts'

/**
 * ComposeMediaActions:
 * Action toolbar buttons for Media, Camera, Polls, Asset tagging, and Location.
 */
export const ComposeMediaActions = () => {
  const showPicker = composeShowAssetPicker.value ||
    composeSelectedSymbol.value !== null

  return (
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
  )
}
