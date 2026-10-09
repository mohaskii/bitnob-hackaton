import { communityActivities } from '../home-state.ts'
import { CommunityActivityItem } from './CommunityActivityItem.tsx'

/**
 * CommunityActivityFeed:
 * Thin orchestrator for real-time community stream (Rule 5: Decomposition Discipline).
 */
export const CommunityActivityFeed = () => {
  const activities = communityActivities.value

  return (
    <div class='flex flex-col gap-2.5'>
      <div class='flex items-center justify-between'>
        <h2 class='text-base font-bold text-base-content'>
          Activité de la Communauté
        </h2>
      </div>

      <div class='flex flex-col gap-2.5'>
        {activities.map((activity) => (
          <CommunityActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}
