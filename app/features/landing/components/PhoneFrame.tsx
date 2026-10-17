import type { PhoneScreen } from '../landing-content.ts'
import { PhoneScreenLayer } from './PhoneScreenLayer.tsx'
import { PhoneStatusBar } from './PhoneStatusBar.tsx'

type PhoneFrameProps = {
  /** One screen, or several stacked for scroll-driven transitions. */
  screens: PhoneScreen[]
  class?: string
  eager?: boolean
}

/**
 * PhoneFrame:
 * Flat phone mockup (no shadow, no border): graphite band + black bezel,
 * side buttons, dynamic island. The status bar stays on top while the app
 * screens (`data-phone-screen`) move underneath it, clipped by the display.
 */
export const PhoneFrame = ({ screens, class: cls = '', eager }: PhoneFrameProps) => (
  <div class={`relative aspect-[390/912] [container-type:inline-size] ${cls}`}>
    <span class='absolute -left-[1.4%] top-[17%] h-[5%] w-[1.6%] rounded-l bg-[#3a3a3a]' />
    <span class='absolute -left-[1.4%] top-[25%] h-[9%] w-[1.6%] rounded-l bg-[#3a3a3a]' />
    <span class='absolute -left-[1.4%] top-[36%] h-[9%] w-[1.6%] rounded-l bg-[#3a3a3a]' />
    <span class='absolute -right-[1.4%] top-[28%] h-[13%] w-[1.6%] rounded-r bg-[#3a3a3a]' />

    <div class='absolute inset-0 rounded-[15%/7%] bg-[#3a3a3a] p-[1.2%]'>
      <div class='h-full w-full rounded-[14%/6.5%] bg-black p-[3.2%]'>
        <div class='relative h-full w-full overflow-hidden rounded-[11%/5.2%] bg-[#f5f5f3]'>
          <div class='absolute inset-x-0 top-[7%] bottom-0 overflow-hidden bg-[#f5f5f3]'>
            {screens.map((screen, i) => (
              <PhoneScreenLayer key={screen.src} screen={screen} index={i} eager={eager} />
            ))}
          </div>
          <div class='absolute inset-x-0 top-0 h-[7%]'>
            {screens.map((screen, i) => (
              <div
                key={screen.src}
                data-phone-status={i}
                class={`absolute inset-0 ${i === 0 ? '' : 'opacity-0'}`}
              >
                <PhoneStatusBar tone={screen.statusTone} />
              </div>
            ))}
          </div>
          <span class='absolute left-1/2 top-[1.6%] h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-black' />
        </div>
      </div>
    </div>
  </div>
)
