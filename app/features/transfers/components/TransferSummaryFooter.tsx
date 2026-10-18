import { CheckCircle2, Loader2, Send } from 'lucide-preact'
import {
  canSubmit,
  isTransferSubmitting,
  submitTransfer,
  transferAmount,
  transferError,
} from '../transfer-state.ts'

export const TransferSummaryFooter = () => {
  const loading = isTransferSubmitting.value
  const disabled = !canSubmit.value

  return (
    <div class='mt-auto pt-4 flex flex-col gap-3'>
      {/* Fee Badge */}
      <div class='flex items-center justify-between px-3 py-2.5 rounded-xl bg-base-200 text-xs'>
        <span class='text-base-content/70'>Frais de transfert</span>
        <span class='font-bold text-success flex items-center gap-1'>
          <CheckCircle2 size={13} />
          0 FCFA (Gratuit instantané)
        </span>
      </div>

      {/* Error Banner */}
      {transferError.value && (
        <div class='p-3 rounded-xl bg-error/10 text-error text-xs font-medium'>
          {transferError.value}
        </div>
      )}

      {/* Main Submit Action */}
      <button
        type='button'
        disabled={disabled}
        onClick={submitTransfer}
        class={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
          disabled
            ? 'bg-base-300 text-base-content/40 cursor-not-allowed'
            : 'bg-primary text-primary-content hover:opacity-95 active:scale-[0.99]'
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={18} class='animate-spin' />
            <span>Envoi en cours...</span>
          </>
        ) : (
          <>
            <Send size={18} />
            <span>Envoyer {transferAmount.value.toLocaleString('fr-FR')} FCFA</span>
          </>
        )}
      </button>
    </div>
  )
}
