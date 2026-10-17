type StatCardProps = {
  value: number
  suffix: string
  label: string
  note: string
}

/** Key figure; `data-count` lets the motion engine count up to `value`. */
export const StatCard = ({ value, suffix, label, note }: StatCardProps) => (
  <div data-reveal class='bg-base-100 rounded-[1.75rem] p-6 lg:p-8 flex flex-col gap-2'>
    <p class='text-[44px] lg:text-[56px] leading-none font-black tracking-tight tk-mono'>
      <span data-count={value}>{value.toLocaleString('fr-FR')}</span>
      {suffix}
    </p>
    <p class='text-[16px] font-extrabold'>{label}</p>
    <p class='text-[13px] text-base-content/55 leading-relaxed'>{note}</p>
  </div>
)
