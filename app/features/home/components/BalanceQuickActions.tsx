import { ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-preact'
import {
  openCardModal,
  openDepositModal,
  openWithdrawModal,
} from '../home-state.ts'

type BalanceQuickActionsProps = {
  onDeposit?: () => void
  onWithdraw?: () => void
  onCard?: () => void
}

/**
 * BalanceQuickActions:
 * Quick actions tray for Bitnob operations:
 * 1. Déposer (Lightning / USDT)
 * 2. Retirer (Wave / OM)
 * 3. Carte Visa (highlighted for dividend spending)
 */
export const BalanceQuickActions = ({
  onDeposit = openDepositModal,
  onWithdraw = openWithdrawModal,
  onCard = openCardModal,
}: BalanceQuickActionsProps) => {
  return (
    <div class='mt-6 bg-neutral-content/5 card flex flex-row p-3 items-center justify-around gap-2 relative z-10'>
      {/* 1. Déposer (Lightning / USDT) */}
      <button
        type='button'
        onClick={onDeposit}
        class='flex flex-col items-center group cursor-pointer active:scale-95 transition-transform focus:outline-none'
      >
        <div class='w-12 h-12 rounded-full bg-neutral-content/10 text-neutral-content flex items-center justify-center transition-colors group-hover:bg-neutral-content/15'>
          <ArrowDownLeft size={21} strokeWidth={2.2} />
        </div>
        <span class='text-xs font-medium text-neutral-content/90 mt-1.5'>
          Déposer
        </span>
        <span class='text-[10px] text-neutral-content/50'>
          Lightning • USDT
        </span>
      </button>

      {/* 2. Retirer (Wave / OM) */}
      <button
        type='button'
        onClick={onWithdraw}
        class='flex flex-col items-center group cursor-pointer active:scale-95 transition-transform focus:outline-none'
      >
        <div class='w-12 h-12 rounded-full bg-neutral-content/10 text-neutral-content flex items-center justify-center transition-colors group-hover:bg-neutral-content/15'>
          <ArrowUpRight size={21} strokeWidth={2.2} />
        </div>
        <span class='text-xs font-medium text-neutral-content/90 mt-1.5'>
          Retirer
        </span>
        <span class='text-[10px] text-neutral-content/50'>Wave • OM</span>
      </button>

      {/* 3. Carte Visa (Bitnob Virtual Card) */}
      <button
        type='button'
        onClick={onCard}
        class='flex flex-col items-center group cursor-pointer active:scale-95 transition-transform focus:outline-none'
      >
        <div class='w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center transition-transform group-hover:scale-105  '>
          <CreditCard size={21} strokeWidth={2.2} />
        </div>
        <span class='text-xs font-bold text-primary mt-1.5'>Carte Visa</span>
        <span class='text-[10px] text-neutral-content/50'>Dépenser gains</span>
      </button>
    </div>
  )
}
