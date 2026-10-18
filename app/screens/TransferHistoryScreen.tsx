import { useEffect } from 'preact/hooks'
import { TransferHistoryHeader } from '../features/transfers/components/history/TransferHistoryHeader.tsx'
import { TransferHistoryList } from '../features/transfers/components/history/TransferHistoryList.tsx'
import { loadHistory } from '../features/transfers/transfer-state.ts'

/**
 * TransferHistoryScreen:
 * - Dedicated full screen for viewing transfer history (accessed from the sidebar menu)
 * - State engine in app/features/transfers/transfer-state.ts
 */
export const TransferHistoryScreen = () => {
  useEffect(() => {
    void loadHistory()
  }, [])

  return (
    <div class='fixed inset-0 z-50 bg-base-100 text-base-content flex flex-col select-none animate-in fade-in duration-150'>
      <TransferHistoryHeader />
      <main class='flex-1 overflow-y-auto pt-3 max-w-lg mx-auto w-full flex flex-col'>
        <TransferHistoryList />
      </main>
    </div>
  )
}
