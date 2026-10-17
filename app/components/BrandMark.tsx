type BrandMarkProps = {
  /**
   * Text color of the wordmark: light on dark heroes, base content elsewhere,
   * auto follows a parent `group` carrying `data-solid` (landing nav).
   */
  tone?: 'light' | 'base' | 'auto'
}

const TONE_CLASS = {
  light: 'text-white',
  base: 'text-base-content',
  auto: 'text-white group-data-[solid=true]:text-base-content',
}

/** BrandMark: yellow "T" tile + TekkiTrade wordmark. */
export const BrandMark = ({ tone = 'light' }: BrandMarkProps) => (
  <div class='flex items-center gap-2'>
    <span class='w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black'>
      T
    </span>
    <span
      class={`font-extrabold tracking-tight text-lg transition-colors duration-300 ${
        TONE_CLASS[tone]
      }`}
    >
      TekkiTrade
    </span>
  </div>
)
