import { BatteryFull, Signal, Wifi } from 'lucide-preact'

type PhoneStatusBarProps = { tone: 'dark' | 'light' }

/** Fake iOS-style status bar painted in the color of the screen's top edge. */
export const PhoneStatusBar = ({ tone }: PhoneStatusBarProps) => (
  <div
    class={`h-full px-[9%] flex items-end justify-between pb-[1.5%] text-[clamp(8px,2.6cqw,12px)] font-bold ${
      tone === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f5f3] text-[#1a1a1a]'
    }`}
  >
    <span class='tk-mono'>9:41</span>
    <span class='flex items-center gap-[0.35em]'>
      <Signal size='1.15em' strokeWidth={2.6} />
      <Wifi size='1.15em' strokeWidth={2.6} />
      <BatteryFull size='1.35em' strokeWidth={2.2} />
    </span>
  </div>
)
