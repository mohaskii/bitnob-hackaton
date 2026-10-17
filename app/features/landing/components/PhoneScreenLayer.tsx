import type { PhoneScreen } from '../landing-content.ts'

type PhoneScreenLayerProps = {
  screen: PhoneScreen
  index: number
  eager?: boolean
}

/**
 * One app screen inside the phone. Layers stack in DOM order: the motion
 * engine slides the next one up over the previous one, which drifts up and
 * dims (`data-phone-dim`), like a native push transition.
 */
export const PhoneScreenLayer = ({ screen, index, eager }: PhoneScreenLayerProps) => (
  <div
    data-phone-screen={index}
    class={`absolute inset-0 overflow-hidden will-change-transform ${index === 0 ? '' : 'opacity-0'}`}
  >
    <img
      src={screen.src}
      alt={screen.alt}
      width={390}
      height={844}
      loading={eager ? 'eager' : 'lazy'}
      decoding='async'
      draggable={false}
      class='block h-full w-full object-cover object-top'
    />
    <span data-phone-dim class='absolute inset-0 bg-black opacity-0 pointer-events-none' />
  </div>
)
