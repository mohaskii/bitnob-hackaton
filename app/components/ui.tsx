import type { ComponentChildren } from 'preact'
import { CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-preact'
import { dismissToast, toasts } from '../state.ts'

/* -------------------------------------------------------------------------- */
/* Small shared building blocks                                               */
/* -------------------------------------------------------------------------- */

type Tone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'dark'

const TONES: Record<Tone, string> = {
  neutral: 'bg-base-200 text-base-content/70',
  primary: 'bg-primary text-primary-content',
  success: 'bg-success/15 text-success',
  error: 'bg-error/15 text-error',
  warning: 'bg-warning/20 text-base-content',
  info: 'bg-sky-500/15 text-sky-700',
  dark: 'bg-white/10 text-white/80',
}

export const Pill = (
  { tone = 'neutral', children }: { tone?: Tone; children: ComponentChildren },
) => (
  <span
    class={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
      TONES[tone]
    }`}
  >
    {children}
  </span>
)

/** Data provenance tags shown wherever a number appears. */
export const DelayedTag = ({ dark = false }: { dark?: boolean }) => (
  <Pill tone={dark ? 'dark' : 'info'}>● Cours différé BRVM</Pill>
)
export const SimulatedTag = ({ dark = false }: { dark?: boolean }) => (
  <Pill tone={dark ? 'dark' : 'warning'}>Argent fictif</Pill>
)
export const DemoPartnerTag = () => (
  <Pill tone='neutral'>SGI de démonstration</Pill>
)

export const SectionTitle = (
  { title, action }: { title: string; action?: ComponentChildren },
) => (
  <div class='flex items-center justify-between gap-3'>
    <h2 class='text-[15px] font-extrabold tracking-tight text-base-content'>
      {title}
    </h2>
    {action}
  </div>
)

export const Card = (
  { children, class: extra = '' }: {
    children: ComponentChildren
    class?: string
  },
) => <div class={`bg-base-100 rounded-3xl p-4 ${extra}`}>{children}</div>

export const Spinner = ({ size = 16 }: { size?: number }) => (
  <Loader2 size={size} class='animate-spin' />
)

export const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  pending = false,
  tone = 'primary',
}: {
  children: ComponentChildren
  onClick?: () => void
  disabled?: boolean
  pending?: boolean
  tone?: 'primary' | 'dark' | 'ghost'
}) => (
  <button
    type='button'
    onClick={onClick}
    disabled={disabled || pending}
    class={`w-full h-13 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 cursor-pointer ${
      tone === 'primary'
        ? 'bg-primary text-primary-content'
        : tone === 'dark'
        ? 'bg-neutral text-neutral-content'
        : 'bg-base-200 text-base-content'
    }`}
  >
    {pending && <Spinner />}
    {children}
  </button>
)

export const InlineError = ({ message }: { message: string | null }) =>
  message
    ? (
      <p class='text-xs font-semibold text-error bg-error/10 rounded-xl px-3 py-2'>
        {message}
      </p>
    )
    : null

/** Bottom sheet with backdrop. Rendered only when `open`. */
export const Sheet = ({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: ComponentChildren
  children: ComponentChildren
}) =>
  open
    ? (
      <div
        class='fixed inset-0 z-[60] flex items-end justify-center bg-black/45 backdrop-blur-[2px] tk-fade-in'
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div class='w-full max-w-[480px] max-h-[92dvh] overflow-y-auto bg-base-200 rounded-t-[2rem] pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] tk-slide-up'>
          <div class='sticky top-0 z-10 bg-base-200/95 backdrop-blur px-5 pt-3 pb-2'>
            <div class='mx-auto w-10 h-1.5 rounded-full bg-base-300 mb-3' />
            <div class='flex items-center justify-between gap-3'>
              <div class='min-w-0 flex-1'>{title}</div>
              <button
                type='button'
                onClick={onClose}
                aria-label='Fermer'
                class='w-9 h-9 rounded-full bg-base-100 flex items-center justify-center text-base-content/60 cursor-pointer'
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div class='px-5 pt-2 flex flex-col gap-4'>{children}</div>
        </div>
      </div>
    )
    : null

const TOAST_ICONS = { success: CheckCircle2, error: XCircle, info: Info }

export const ToastStack = () => (
  <div class='fixed top-[calc(env(safe-area-inset-top,0px)+0.75rem)] inset-x-0 z-[80] flex flex-col items-center gap-2 px-4 pointer-events-none'>
    {toasts.value.map((toast) => {
      const Icon = TOAST_ICONS[toast.tone]
      return (
        <button
          key={toast.id}
          type='button'
          onClick={() => dismissToast(toast.id)}
          class='pointer-events-auto max-w-[440px] w-full flex items-start gap-2.5 bg-neutral text-neutral-content rounded-2xl px-4 py-3 text-left text-[13px] font-semibold shadow-xl tk-slide-down'
        >
          <Icon
            size={18}
            class={`flex-shrink-0 mt-px ${
              toast.tone === 'success'
                ? 'text-success'
                : toast.tone === 'error'
                ? 'text-error'
                : 'text-primary'
            }`}
          />
          <span>{toast.message}</span>
        </button>
      )
    })}
  </div>
)

/** A labelled amount row used in fee breakdowns and contract notes. */
export const AmountRow = ({
  label,
  hint,
  value,
  strong = false,
}: {
  label: ComponentChildren
  hint?: string
  value: string
  strong?: boolean
}) => (
  <div class='flex items-start justify-between gap-3 py-2'>
    <div class='min-w-0'>
      <p
        class={`text-[13px] ${
          strong ? 'font-extrabold' : 'font-semibold text-base-content/80'
        }`}
      >
        {label}
      </p>
      {hint && <p class='text-[11px] text-base-content/50 mt-0.5'>{hint}</p>}
    </div>
    <p
      class={`text-[13px] text-right whitespace-nowrap ${
        strong ? 'font-extrabold' : 'font-bold'
      }`}
    >
      {value}
    </p>
  </div>
)
