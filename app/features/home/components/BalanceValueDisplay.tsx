type BalanceValueDisplayProps = {
  displayFcfa: string
  displayUsdt: string
}

/**
 * BalanceValueDisplay:
 * Total wealth typography in FCFA + USD/USDT equivalent.
 */
export const BalanceValueDisplay = ({
  displayFcfa,
  displayUsdt,
}: BalanceValueDisplayProps) => {
  return (
    <div class='flex flex-col items-center text-center relative z-10 pt-[4rem]'>
      <span class='text-xs uppercase tracking-widest text-neutral-content/60 font-semibold'>
        Valeur du Patrimoine
      </span>
      <div class='text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-content mt-1.5 font-sans'>
        {displayFcfa}{' '}
        <span class='text-xl sm:text-2xl font-bold text-neutral-content/80'>
          FCFA
        </span>
      </div>
      <div class='text-xs font-medium text-neutral-content/60 mt-1'>
        ≈ {displayUsdt} USDT
      </div>
    </div>
  )
}
