import { setNote, transferNote } from '../transfer-state.ts'

export const TransferNoteInput = () => {
  return (
    <div class='flex flex-col gap-2'>
      <label class='text-xs font-semibold text-base-content/70 uppercase tracking-wider'>
        Motif (Optionnel)
      </label>
      <input
        type='text'
        maxLength={80}
        value={transferNote.value}
        onInput={(e) => setNote((e.target as HTMLInputElement).value)}
        placeholder='Ex: Partage resto, Remboursement...'
        class='w-full bg-base-200 text-base-content text-sm rounded-2xl px-4 py-3 focus:outline-none focus:bg-base-200/80 transition-colors'
      />
    </div>
  )
}
