import { ComposeHeader } from '../features/compose/components/ComposeHeader.tsx'
import { ComposeAuthorRow } from '../features/compose/components/ComposeAuthorRow.tsx'
import { ComposeTextarea } from '../features/compose/components/ComposeTextarea.tsx'
import { ComposeAssetPicker } from '../features/compose/components/ComposeAssetPicker.tsx'
import { ComposeToolbar } from '../features/compose/components/ComposeToolbar.tsx'

interface ComposeScreenProps {
  onClose?: () => void
}

/**
 * ComposeScreen:
 * - Thin layout orchestrator (Rule 5: Decomposition Discipline)
 * - State engine lives in app/features/compose/compose-state.ts
 */
export const ComposeScreen = ({ onClose }: ComposeScreenProps) => {
  return (
    <div class='fixed inset-0 z-50 bg-base-100 text-base-content flex flex-col justify-between select-none animate-in fade-in duration-150'>
      <ComposeHeader onClose={onClose} />

      <div class='flex-1 overflow-y-auto px-4 pt-3.5 flex flex-col gap-3'>
        <ComposeAuthorRow />
        <ComposeTextarea />
        <ComposeAssetPicker />
      </div>

      <ComposeToolbar />
    </div>
  )
}
