import { ComposeHeader } from '../features/compose/components/ComposeHeader.tsx'
import { ComposeAuthorRow } from '../features/compose/components/ComposeAuthorRow.tsx'
import { ComposeTextarea } from '../features/compose/components/ComposeTextarea.tsx'
import { ComposeAssetPicker } from '../features/compose/components/ComposeAssetPicker.tsx'
import { ComposeToolbar } from '../features/compose/components/ComposeToolbar.tsx'

type ComposeScreenProps = {
  onClose?: () => void
}

/**
 * ComposeScreen:
 * - Thin layout orchestrator (Rule 5: Decomposition Discipline)
 * - State engine lives in app/features/compose/compose-state.ts
 * - Full screen on mobile, centered dialog over a dimmed canvas on desktop (lg+)
 */
export const ComposeScreen = ({ onClose }: ComposeScreenProps) => {
  return (
    <div class='fixed inset-0 z-50 bg-base-100 lg:bg-black/45 lg:backdrop-blur-[2px] lg:flex lg:items-center lg:justify-center lg:p-6 text-base-content select-none animate-in fade-in duration-150'>
      <div class='h-full w-full lg:h-auto lg:max-h-[85dvh] lg:max-w-xl bg-base-100 lg:rounded-[2rem] lg:overflow-hidden flex flex-col justify-between'>
        <ComposeHeader onClose={onClose} />

        <div class='flex-1 overflow-y-auto px-4 pt-3.5 lg:pb-4 flex flex-col gap-3'>
          <ComposeAuthorRow />
          <ComposeTextarea />
          <ComposeAssetPicker />
        </div>

        <ComposeToolbar />
      </div>
    </div>
  )
}
