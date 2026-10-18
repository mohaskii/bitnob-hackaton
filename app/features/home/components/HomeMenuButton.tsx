import { openSidebar } from '../home-state.ts'

type HomeMenuButtonProps = {
  onClick?: () => void
}

/**
 * HomeMenuButton:
 * Top-right staggered menu icon replacing avatar on the Grande Carte Noire.
 * Uses exact SVG path: d="M4 6H20M4 12H14M4 18H9"
 */
export const HomeMenuButton = ({ onClick = openSidebar }: HomeMenuButtonProps) => (
  <div class='absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] right-5 z-20'>
    <button
      type='button'
      onClick={onClick}
      aria-label='Menu principal'
      class='w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-neutral-content flex items-center justify-center cursor-pointer'
    >
      <svg
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        class='w-6 h-6'
      >
        <path
          d='M4 6H20M4 12H14M4 18H9'
          stroke='currentColor'
          stroke-width='2'
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </svg>
    </button>
  </div>
)
