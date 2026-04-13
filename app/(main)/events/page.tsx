import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default async function EventsPage() {
  const session = await getSession()
  const now = new Date()

  const events = await db.tastingEvent.findMany({
    include: {
      creator: true,
      attendees: { include: { user: true } },
      wines: { include: { wine: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  const upcoming = events.filter((e) => e.scheduledAt >= now)
  const past = events.filter((e) => e.scheduledAt < now).reverse()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brown">Tasting Events</h1>
        <Link
          href="/events/new"
          className="text-sm bg-wine text-white px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors font-medium"
        >
          + New Event
        </Link>
      </div>

      {events.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-lg mb-2">No events yet</p>
          <p className="text-sm">
            <Link href="/events/new" className="text-wine hover:underline">Create your first tasting event</Link>
          </p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} currentUserId={session!.userId} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            Past ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} currentUserId={session!.userId} past />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function EventCard({
  event,
  currentUserId,
  past = false,
}: {
  event: any
  currentUserId: number
  past?: boolean
}) {
  const isAttending = event.attendees.some((a: any) => a.userId === currentUserId)

  return (
    <Link
      href={`/events/${event.id}`}
      className={`block bg-card rounded-xl border transition-colors px-5 py-4 ${
        past ? 'border-border opacity-75 hover:opacity-100' : 'border-border hover:border-wine/40'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-brown text-base">{event.name}</h3>
          <p className="text-sm text-muted mt-0.5">
            {new Date(event.scheduledAt).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
              year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {event.location && (
            <p className="text-sm text-muted mt-0.5">📍 {event.location}</p>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-muted">
            {event.attendees.length} guest{event.attendees.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-muted">
            {event.wines.length} wine{event.wines.length !== 1 ? 's' : ''}
          </div>
          {isAttending && (
            <span className="text-xs text-wine font-medium">You&apos;re going</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {event.attendees.slice(0, 5).map((a: any) => (
          <span
            key={a.userId}
            className="w-6 h-6 rounded-full bg-wine/10 text-wine text-xs flex items-center justify-center font-bold"
            title={a.user.name}
          >
            {a.user.name.charAt(0).toUpperCase()}
          </span>
        ))}
        {event.attendees.length > 5 && (
          <span className="text-xs text-muted">+{event.attendees.length - 5} more</span>
        )}
      </div>
    </Link>
  )
}
