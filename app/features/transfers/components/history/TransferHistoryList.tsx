import { ArrowLeftRight, Loader2 } from 'lucide-preact'
import {
  isHistoryLoading,
  navigateToTransfer,
  transferHistory,
} from '../../transfer-state.ts'
import { TransferHistoryItemRow } from './TransferHistoryItemRow.tsx'

export const TransferHistoryList = () => {
  const loading = isHistoryLoading.value
  const list = transferHistory.value

  if (loading) {
    return (
      <div class='flex-1 flex flex-col items-center justify-center p-8 text-base-content/50 gap-2'>
        <Loader2 size={24} class='animate-spin' />
        <span class='text-xs'>Chargement de l'historique...</span>
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div class='flex-1 flex flex-col items-center justify-center p-8 text-center text-base-content/60 gap-3'>
        <div class='w-14 h-14 rounded-full bg-base-200 flex items-center justify-center text-base-content/40'>
          <ArrowLeftRight size={24} />
        </div>
        <div class='flex flex-col gap-1'>
          <h3 class='text-sm font-bold text-base-content'>Aucun transfert trouvé</h3>
          <p class='text-xs text-base-content/60 max-w-xs'>
            Vous n'avez pas encore envoyé ou reçu de fonds via TekkiTrade Transfer.
          </p>
        </div>
        <button
          type='button'
          onClick={navigateToTransfer}
          class='mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-content text-xs font-bold transition-all active:scale-95 cursor-pointer'
        >
          Faire un premier transfert
        </button>
      </div>
    )
  }

  return (
    <div class='flex flex-col gap-2.5 px-4 pb-8'>
      {list.map((item) => (
        <TransferHistoryItemRow key={item.transferId} item={item} />
      ))}
    </div>
  )
}
