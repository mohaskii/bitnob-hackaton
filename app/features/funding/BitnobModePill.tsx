import { Pill } from '../../components/ui.tsx'
import { bitnobMode } from '../session/session-state.ts'

/** Shows whether Bitnob runs in simulation, sandbox or live mode. */
export const BitnobModePill = ({ dark = false }: { dark?: boolean }) => (
  <Pill
    tone={dark
      ? 'dark'
      : bitnobMode.value === 'simulation'
      ? 'warning'
      : 'success'}
  >
    Bitnob ·{' '}
    {bitnobMode.value === 'simulation' ? 'simulation' : bitnobMode.value}
  </Pill>
)
