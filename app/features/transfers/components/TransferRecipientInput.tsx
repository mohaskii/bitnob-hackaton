import { User as UserIcon } from 'lucide-preact'
import {
  QUICK_CONTACTS,
  setRecipient,
  transferRecipient,
} from '../transfer-state.ts'

export const TransferRecipientInput = () => {
  return (
    <div class='flex flex-col gap-2'>
      <label class='text-xs font-semibold text-base-content/70 uppercase tracking-wider'>
        Destinataire
      </label>
      <div class='relative flex items-center'>
        <span class='absolute left-4 text-base font-bold text-base-content/40 select-none'>
          @
        </span>
        <input
          type='text'
          value={transferRecipient.value}
          onInput={(e) => setRecipient((e.target as HTMLInputElement).value)}
          placeholder='pseudo ou email'
          class='w-full bg-base-200 text-base-content text-base font-medium rounded-2xl pl-9 pr-4 py-3.5 focus:outline-none focus:bg-base-200/80 transition-colors'
        />
      </div>

      <div class='mt-1 flex flex-col gap-1.5'>
        <span class='text-[11px] font-medium text-base-content/50 uppercase tracking-wider'>
          Contacts récents
        </span>
        <div class='flex flex-wrap gap-2'>
          {QUICK_CONTACTS.map((c) => (
            <button
              key={c.id}
              type='button'
              onClick={() => setRecipient(c.handle)}
              class='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-base-200 hover:bg-base-300 text-xs font-medium text-base-content/80 active:scale-95 transition-all cursor-pointer'
            >
              <UserIcon size={12} class='text-base-content/50' />
              <span>@{c.handle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
