import {
  CommunityTradeActivity,
  toggleCopyCommunityTrade,
} from '../home-state.ts'

type CommunityActivityItemProps = {
  activity: CommunityTradeActivity
}

/**
 * CommunityActivityItem:
 * Individual community trade row with avatar, description, and 1-tap copy button.
 */
export const CommunityActivityItem = ({
  activity,
}: CommunityActivityItemProps) => {
  return (
    <div class='bg-base-100 rounded-2xl p-4 flex items-center justify-between gap-3.5 select-none'>
      <div class='flex items-center gap-3 min-w-0'>
        <div class='w-11 h-11 rounded-full bg-base-300 overflow-hidden flex-shrink-0'>
          <img
            src={activity.avatarUrl}
            alt={activity.traderName}
            class='w-full h-full object-cover'
          />
        </div>
        <div class='min-w-0'>
          <div class='text-sm text-base-content leading-snug'>
            <span class='font-bold'>{activity.traderName}</span>{' '}
            {activity.actionType === 'buy' ? 'a acheté' : 'a copié'}{' '}
            <span
              class={activity.actionType === 'buy'
                ? 'font-bold text-success'
                : 'font-bold'}
            >
              {activity.targetName}
            </span>
          </div>
          <div class='text-xs text-base-content/50 mt-0.5'>
            {activity.timeAgo} • {activity.amountDetail}
          </div>
        </div>
      </div>

      {activity.isCopied
        ? (
          <span class='badge bg-base-200 border-0 text-xs text-base-content/70 font-semibold px-2.5 py-3'>
            Copie active
          </span>
        )
        : (
          <button
            type='button'
            onClick={() => toggleCopyCommunityTrade(activity.id)}
            class='h-8.5 px-4 rounded-full bg-primary text-primary-content text-xs font-bold flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95 transition-transform'
          >
            Copier
          </button>
        )}
    </div>
  )
}
