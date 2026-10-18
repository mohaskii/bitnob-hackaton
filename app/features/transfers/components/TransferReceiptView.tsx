import { Check, CheckCircle2 } from 'lucide-preact'
import {
  navigateBackFromTransfer,
  resetTransferForm,
  transferReceipt,
} from '../transfer-state.ts'

export const TransferReceiptView = () => {
  const receipt = transferReceipt.value
  if (!receipt) return null

  return (
    <div class='flex-1 flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200'>
      <div class='w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center mb-4'>
        <Check size={32} strokeWidth={3} />
      </div>

      <p class='text-xs font-semibold text-base-content/60 uppercase tracking-wider'>
        Transfert effectué avec succès
      </p>
      <h2 class='text-3xl font-extrabold text-base-content mt-1 mb-6'>
        {receipt.amountFcfa.toLocaleString('fr-FR')} FCFA
      </h2>

      {/* Details Card */}
      <div class='w-full max-w-sm bg-base-200 rounded-2xl p-4 flex flex-col gap-3 text-sm mb-6'>
        <div class='flex items-center justify-between'>
          <span class='text-base-content/60'>Destinataire</span>
          <span class='font-bold text-base-content'>@{receipt.recipient.login}</span>
        </div>
        <div class='flex items-center justify-between'>
          <span class='text-base-content/60'>Référence</span>
          <span class='font-mono font-medium text-xs text-base-content'>{receipt.reference}</span>
        </div>
        <div class='flex items-center justify-between'>
          <span class='text-base-content/60'>Statut</span>
          <span class='font-semibold text-xs text-success flex items-center gap-1'>
            <CheckCircle2 size={13} />
            Instantané
          </span>
        </div>
        {receipt.note && (
          <div class='flex items-center justify-between pt-2 border-t border-base-300'>
            <span class='text-base-content/60'>Message</span>
            <span class='text-xs italic text-base-content'>{receipt.note}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div class='w-full max-w-sm flex flex-col gap-2'>
        <button
          type='button'
          onClick={resetTransferForm}
          class='w-full py-3.5 rounded-2xl bg-base-200 hover:bg-base-300 text-base-content font-semibold text-sm transition-all cursor-pointer'
        >
          Faire un autre transfert
        </button>
        <button
          type='button'
          onClick={navigateBackFromTransfer}
          class='w-full py-3.5 rounded-2xl bg-neutral text-neutral-content font-bold text-sm transition-all cursor-pointer'
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
