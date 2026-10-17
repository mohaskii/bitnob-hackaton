/** Shared bits of the order sheet: formatting and the segmented control. */

export const fcfa = (v: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(v))} FCFA`

export const qty = (v: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 }).format(v)

export const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

export type SegmentOption<T extends string> = {
  id: T
  label: string
  /** Colour of the selected segment (default: near-black). */
  active?: string
}

export const Segmented = <T extends string>(
  { options, value, onChange }: {
    options: SegmentOption<T>[]
    value: T
    onChange: (v: T) => void
  },
) => (
  <div
    class='grid gap-1 bg-base-200 rounded-2xl p-1'
    style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
  >
    {options.map((o) => (
      <button
        key={o.id}
        type='button'
        onClick={() => onChange(o.id)}
        class={`h-10 rounded-xl text-[13px] font-extrabold cursor-pointer transition-colors ${
          value === o.id
            ? o.active ?? 'bg-neutral text-neutral-content'
            : 'text-base-content/50'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
)
