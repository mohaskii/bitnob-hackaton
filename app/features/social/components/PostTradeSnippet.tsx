import { Copy } from 'lucide-preact'
import { SocialPost } from '../../../state.ts'
import { handleCopyPostTrade } from '../social-state.ts'

type PostTradeSnippetProps = {
  post: SocialPost
}

export const PostTradeSnippet = ({ post }: PostTradeSnippetProps) => {
  const trade = post.trade
  if (!trade) return null

  const isBuy = trade.action === 'ACHAT'
  const formattedPrice = new Intl.NumberFormat('fr-FR').format(trade.priceFcfa)

  return (
    <div class='bg-base-200/60 rounded-xl p-3 flex items-center justify-between gap-3'>
      <div class='flex items-center gap-2.5 min-w-0'>
        <span
          class={`badge badge-sm border-0 font-extrabold text-[10px] ${
            isBuy
              ? 'bg-success text-success-content'
              : 'bg-error text-error-content'
          }`}
        >
          {trade.action}
        </span>
        <span class='font-bold text-sm text-base-content'>
          {trade.symbol}
        </span>
        <span class='text-xs text-base-content/60 font-medium'>
          {formattedPrice} FCFA
        </span>
      </div>

      <button
        type='button'
        onClick={() => handleCopyPostTrade(post)}
        class='h-7 px-3 rounded-full bg-primary text-primary-content text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-transform flex-shrink-0'
      >
        <Copy size={11} strokeWidth={2.5} />
        <span>Copier</span>
      </button>
    </div>
  )
}
