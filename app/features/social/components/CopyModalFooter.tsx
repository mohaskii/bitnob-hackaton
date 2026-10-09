import { AlertCircle } from 'lucide-preact'
import { closeCopyModal, confirmCopy, copyAmount } from '../social-state.ts'

/**
 * CopyModalFooter:
 * Trust / security notice and confirmation CTA buttons.
 */
export const CopyModalFooter = () => {
  const amount = copyAmount.value

  return (
    <>
      {/* Security Guarantee Notice */}
      <div class='flex items-start gap-2 px-1 text-[11px] text-base-content/60 leading-relaxed'>
        <AlertCircle size={14} class='text-primary flex-shrink-0 mt-0.5' />
        <span>
          Exécution instantanée via Bitnob Lightning / BRVM. Vos fonds restent
          protégés et vous pouvez révoquer la copie à tout instant sans frais.
        </span>
      </div>

      {/* Action Buttons */}
      <div class='flex gap-2 pt-1'>
        <button
          type='button'
          onClick={closeCopyModal}
          class='btn btn-sm btn-ghost rounded-full flex-1 text-xs font-semibold'
        >
          Annuler
        </button>
        <button
          type='button'
          onClick={confirmCopy}
          class='btn btn-sm btn-primary rounded-full flex-[2] text-xs font-bold shadow-md shadow-primary/25 cursor-pointer active:scale-95 transition-all'
        >
          Lancer la copie ({new Intl.NumberFormat('fr-FR').format(amount)} F)
        </button>
      </div>
    </>
  )
}
