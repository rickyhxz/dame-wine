'use client'

import { deleteEventAction } from '@/app/actions'

export function DeleteEventButton({ eventId }: { eventId: number }) {
  return (
    <form action={deleteEventAction.bind(null, eventId)}>
      <button
        type="submit"
        className="text-xs text-muted hover:text-red-600 transition-colors"
        onClick={(e) => {
          if (!confirm('Delete this event?')) e.preventDefault()
        }}
      >
        Delete
      </button>
    </form>
  )
}
