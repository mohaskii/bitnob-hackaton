import { TransferHeader } from '../features/transfers/components/TransferHeader.tsx'
import { TransferRecipientInput } from '../features/transfers/components/TransferRecipientInput.tsx'
import { TransferAmountSection } from '../features/transfers/components/TransferAmountSection.tsx'
import { TransferNoteInput } from '../features/transfers/components/TransferNoteInput.tsx'
import { TransferSummaryFooter } from '../features/transfers/components/TransferSummaryFooter.tsx'
import { TransferReceiptView } from '../features/transfers/components/TransferReceiptView.tsx'
import { transferReceipt } from '../features/transfers/transfer-state.ts'

/**
 * TransferScreen:
 * - Dedicated full screen for P2P transfers (replacing the modal)
 * - Pure fine-grained subcomponents (Rule 5: Decomposition Discipline)
 * - State engine lives in app/features/transfers/transfer-state.ts
 */
export const TransferScreen = () => {
  const receipt = transferReceipt.value

  if (receipt) {
    return (
      <div class='fixed inset-0 z-50 bg-base-100 flex flex-col select-none'>
        <TransferReceiptView />
      </div>
    )
  }

  return (
    <div class='fixed inset-0 z-50 bg-base-100 text-base-content flex flex-col select-none animate-in fade-in duration-150'>
      <TransferHeader />

      <main class='flex-1 overflow-y-auto px-5 pt-4 pb-8 flex flex-col gap-5 max-w-lg mx-auto w-full'>
        <TransferRecipientInput />
        <TransferAmountSection />
        <TransferNoteInput />
        <TransferSummaryFooter />
      </main>
    </div>
  )
}
