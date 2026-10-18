import { ArrowDownLeft, ArrowUpRight } from 'lucide-preact'
import type { TransferHistoryItem } from '../../transfer-state.ts'

export const TransferHistoryItemRow = ({ item }: { item: TransferHistoryItem }) => {
  const isSent = item.direction === 'SENT'
  const dateFormatted = new Date(item.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div class='flex items-center justify-between p-4 rounded-2xl bg-base-200'>
      <div class='flex items-center gap-3'>
        <div
          class={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSent ? 'bg-error/15 text-error' : 'bg-success/15 text-success'
          }`}
        >
          {isSent ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
        </div>
        <div class='flex flex-col'>
          <span class='text-sm font-bold text-base-content'>
            {isSent ? `À @${item.counterparty.login}` : `De @${item.counterparty.login}`}
          </span>
          <span class='text-[11px] text-base-content/50 font-mono'>
            {dateFormatted} • {item.reference}
          </span>
          {item.note && (
            <span class='text-xs italic text-base-content/70 mt-0.5 line-clamp-1'>
              "{item.note}"
            </span>
          )}
        </div>
      </div>
      <div class='text-right'>
        <span
          class={`text-sm font-bold ${
            isSent ? 'text-error' : 'text-success'
          }`}
        >
          {isSent ? '-' : '+'}
          {item.amountFcfa.toLocaleString('fr-FR')} FCFA
        </span>
      </div>
    </div>
  )
}
