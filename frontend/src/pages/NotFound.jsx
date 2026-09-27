import { Trophy } from 'lucide-react'
import ButtonLink from '@/components/ui/ButtonLink'
import EmptyState from '@/components/ui/EmptyState'

export default function NotFound() {
  return (
    <div className="card">
      <EmptyState
        icon={Trophy}
        title="Page not found"
        description="That page doesn't exist. The leaderboard is this way."
        action={
          <ButtonLink to="/">Go to the leaderboard</ButtonLink>
        }
      />
    </div>
  )
}
