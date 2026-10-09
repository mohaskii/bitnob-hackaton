/**
 * BalanceWatermark:
 * Concentric circles SVG watermark in top-left corner of the BalanceCard.
 */
export const BalanceWatermark = () => {
  return (
    <svg
      class='absolute top-[env(safe-area-inset-top,0px)] -left-6 w-52 h-52 pointer-events-none opacity-10 text-neutral-content'
      viewBox='0 0 200 200'
      fill='none'
      aria-hidden='true'
    >
      <circle cx='40' cy='40' r='32' stroke='currentColor' strokeWidth='2' />
      <circle cx='40' cy='40' r='62' stroke='currentColor' strokeWidth='2' />
      <circle cx='40' cy='40' r='92' stroke='currentColor' strokeWidth='2' />
      <circle cx='40' cy='40' r='122' stroke='currentColor' strokeWidth='2' />
    </svg>
  )
}
