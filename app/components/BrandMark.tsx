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

/** Same glyph as the app icon (public/logo.svg): a "T" beside rising bars. */
const BrandGlyph = () => (
  <svg viewBox='112 120 288 272' class='w-[62%] h-[62%]' aria-hidden='true'>
    <g fill='currentColor'>
      <rect x='124' y='132' width='198' height='58' rx='14' />
      <rect x='194' y='132' width='58' height='248' rx='14' />
      <rect x='288' y='280' width='42' height='100' rx='10' />
      <rect x='346' y='214' width='42' height='166' rx='10' />
    </g>
  </svg>
)

/** BrandMark: yellow logo tile + TekkiTrade wordmark. */
export const BrandMark = ({ tone = 'light' }: BrandMarkProps) => (
  <div class='flex items-center gap-2'>
    <span class='w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center'>
      <BrandGlyph />
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
