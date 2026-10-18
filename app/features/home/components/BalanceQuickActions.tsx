import {
  openDepositModal,
  openWithdrawModal,
} from '../home-state.ts'
import { navigateToTransfer } from '../../transfers/transfer-state.ts'

type BalanceQuickActionsProps = {
  onDeposit?: () => void
  onWithdraw?: () => void
  onTransfer?: () => void
}

/**
 * Custom SVG card icons accurately matching the user's design reference:
 * A clean credit card outline with top-right action badge (+ / ↓ / ↑).
 */
const DepositCardIcon = () => (
  <svg
    width='22'
    height='22'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 9a2 2 0 0 1 2-2h8' />
    <path d='M3 9h18' />
    <path d='M3 9v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4' />
    <line x1='19' y1='2' x2='19' y2='8' />
    <line x1='16' y1='5' x2='22' y2='5' />
    <line x1='6' y1='15' x2='9' y2='15' />
  </svg>
)

const WithdrawCardIcon = () => (
  <svg
    width='22'
    height='22'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 9a2 2 0 0 1 2-2h8' />
    <path d='M3 9h18' />
    <path d='M3 9v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4' />
    <line x1='19' y1='2' x2='19' y2='8' />
    <polyline points='16 5 19 8 22 5' />
    <line x1='6' y1='15' x2='9' y2='15' />
  </svg>
)

const TransferCardIcon = () => (
  <svg
    width='22'
    height='22'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3 9a2 2 0 0 1 2-2h8' />
    <path d='M3 9h18' />
    <path d='M3 9v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4' />
    <line x1='19' y1='8' x2='19' y2='2' />
    <polyline points='16 5 19 2 22 5' />
    <line x1='6' y1='15' x2='9' y2='15' />
  </svg>
)

/**
 * BalanceQuickActions:
 * Clean, minimal 3-action tray directly mirroring the provided design:
 * 1. Deposit
 * 2. Withdraw
 * 3. Transfer (highlighted lime circle)
 */
export const BalanceQuickActions = ({
  onDeposit = openDepositModal,
  onWithdraw = openWithdrawModal,
  onTransfer = navigateToTransfer,
}: BalanceQuickActionsProps) => {
  return (
    <div class='mt-6 flex flex-row items-center justify-around gap-4 relative z-10 max-w-sm mx-auto'>
      {/* 1. Deposit */}
      <button
        type='button'
        onClick={onDeposit}
        class='flex flex-col items-center group cursor-pointer active:scale-95 transition-transform focus:outline-none'
      >
        <div class='w-14 h-14 rounded-full bg-neutral-content/10 text-neutral-content flex items-center justify-center transition-colors group-hover:bg-neutral-content/15'>
          <DepositCardIcon />
        </div>
        <span class='text-xs font-semibold text-neutral-content/90 mt-2'>
          Deposit
        </span>
      </button>

      {/* 2. Withdraw */}
      <button
        type='button'
        onClick={onWithdraw}
        class='flex flex-col items-center group cursor-pointer active:scale-95 transition-transform focus:outline-none'
      >
        <div class='w-14 h-14 rounded-full bg-neutral-content/10 text-neutral-content flex items-center justify-center transition-colors group-hover:bg-neutral-content/15'>
          <WithdrawCardIcon />
        </div>
        <span class='text-xs font-semibold text-neutral-content/90 mt-2'>
          Withdraw
        </span>
      </button>

      {/* 3. Transfer (Lime/Primary Circle) */}
      <button
        type='button'
        onClick={onTransfer}
        class='flex flex-col items-center group cursor-pointer active:scale-95 transition-transform focus:outline-none'
      >
        <div class='w-14 h-14 rounded-full bg-primary text-primary-content flex items-center justify-center transition-transform group-hover:scale-105'>
          <TransferCardIcon />
        </div>
        <span class='text-xs font-semibold text-neutral-content/90 mt-2'>
          Transfer
        </span>
      </button>
    </div>
  )
}
