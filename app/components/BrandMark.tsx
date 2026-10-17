type BrandMarkProps = {
  /** Text color of the wordmark: light on dark heroes, base content elsewhere. */
  tone?: 'light' | 'base'
}

/** BrandMark: yellow "T" tile + TekkiTrade wordmark. */
export const BrandMark = ({ tone = 'light' }: BrandMarkProps) => (
  <div class='flex items-center gap-2'>
    <span class='w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black'>
      T
    </span>
    <span
      class={`font-extrabold tracking-tight text-lg ${
        tone === 'light' ? 'text-white' : 'text-base-content'
      }`}
    >
      TekkiTrade
    </span>
  </div>
)
