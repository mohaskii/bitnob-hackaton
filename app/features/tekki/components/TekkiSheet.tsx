import { closeTekki, isOpen } from '../tekki-state.ts'
import { TekkiComposer } from './TekkiComposer.tsx'
import { TekkiHeader } from './TekkiHeader.tsx'
import { TekkiThread } from './TekkiThread.tsx'

/** Tekki: a conversation, by text or voice notes, about what's on screen. */
export const TekkiSheet = () =>
  isOpen.value
    ? (
      <div
        class='fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-[2px]'
        onClick={(e) => e.target === e.currentTarget && closeTekki()}
      >
        <div class='w-full max-w-[520px] h-[92dvh] bg-base-200 rounded-t-[1.75rem] overflow-hidden flex flex-col shadow-2xl animate-sheet-up'>
          <TekkiHeader />
          <TekkiThread />
          <TekkiComposer />
        </div>
      </div>
    )
    : null
