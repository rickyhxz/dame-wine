import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { TastingActions } from '@/components/TastingActions'
import { deleteEventAction } from '@/app/actions'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-gold text-sm">
      {'★'.repeat(rating)}<span className="text-border">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  return <span className={`wine-badge wine-badge-${type}`}>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await getSession()

  const event = await db.tastingEvent.findUnique({
    where: { id: parseInt(id) },
    include: {
      creator: true,
      attendees: { include: { user: true } },
      wines: {
        include: {
          wine: {
            include: {
              tastings: {
                include: { user: true },
                orderBy: { tastedAt: 'desc' },
              },
            },
          },
        },
      },
    },
  })

  if (!event) notFound()

  const isCreator = event.createdBy === session!.userId
  const myTastingMap = new Map(
    event.wines.map((ew) => [
      ew.wineId,
      ew.wine.tastings.find((t) => t.userId === session!.userId) ?? null,
    ])
  )

  // Only attendee tastings (not mine) with comments
  const attendeeIds = new Set(event.attendees.map((a) => a.userId))

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back */}
      <Link href="/events" className="text-sm text-muted hover:text-wine">← Events</Link>

      {/* Event header */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-brown">{event.name}</h1>
            <p className="text-sm text-muted mt-1">
              {new Date(event.scheduledAt).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long',
                day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
            {event.location && (
              <p className="text-sm text-muted mt-0.5">📍 {event.location}</p>
            )}
          </div>
          {isCreator && (
            <form action={deleteEventAction.bind(null, event.id)}>
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
          )}
        </div>

        {event.notes && (
          <p className="text-sm text-brown mt-4 pt-4 border-t border-border italic">
            {event.notes}
          </p>
        )}

        {/* Attendees */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
            Attendees ({event.attendees.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {event.attendees.map((a) => (
              <span
                key={a.userId}
                className="flex items-center gap-1.5 text-sm bg-cream border border-border rounded-full px-3 py-1"
              >
                <span className="w-5 h-5 rounded-full bg-wine/10 text-wine text-xs flex items-center justify-center font-bold">
                  {a.user.name.charAt(0).toUpperCase()}
                </span>
                {a.user.name}
                {a.userId === event.createdBy && (
                  <span className="text-xs text-muted">(host)</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Wines with cross-user tasting notes */}
      {event.wines.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Wines on the Menu ({event.wines.length})
          </h2>
          <div className="space-y-4">
            {event.wines.map(({ wine }) => {
              const myTasting = myTastingMap.get(wine.id)
              // Notes from all attendees (including me)
              const attendeeTastings = wine.tastings.filter(
                (t) => attendeeIds.has(t.userId) && t.status === 'TASTED'
              )
              const myNote = wine.tastings.find((t) => t.userId === session!.userId)
              const otherNotes = attendeeTastings.filter((t) => t.userId !== session!.userId)

              return (
                <div key={wine.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  {/* Wine header */}
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link
                        href={`/wines/${wine.id}`}
                        className="font-semibold text-brown hover:text-wine transition-colors"
                      >
                        {wine.name}
                      </Link>
                      <TypeBadge type={wine.type} />
                    </div>
                    <p className="text-xs text-muted">
                      {wine.variety} · {wine.region}, {wine.country}
                      {wine.year ? ` · ${wine.year}` : ''}
                    </p>
                  </div>

                  {/* All attendees' notes */}
                  {attendeeTastings.length > 0 && (
                    <div className="border-t border-border">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide px-5 py-2">
                        Tasting Notes
                      </p>
                      <div className="divide-y divide-border">
                        {attendeeTastings.map((t) => (
                          <div key={t.id} className="px-5 py-3 flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-wine/10 flex items-center justify-center text-wine font-bold text-xs shrink-0">
                              {t.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-brown">{t.user.name}</span>
                                {t.rating && <Stars rating={t.rating} />}
                                {t.tastedAt && (
                                  <span className="text-xs text-muted">
                                    {new Date(t.tastedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {t.comment ? (
                                <p className="text-sm text-brown italic mt-0.5">"{t.comment}"</p>
                              ) : (
                                <p className="text-xs text-muted italic mt-0.5">No notes left</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* My tasting action */}
                  <div className="border-t border-border px-5 py-4 bg-cream/50">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                      Your Tasting
                    </p>
                    <TastingActions
                      wineId={wine.id}
                      tasting={
                        myTasting
                          ? { status: myTasting.status, rating: myTasting.rating, comment: myTasting.comment }
                          : null
                      }
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted text-sm">
          No wines added to this event yet.
        </div>
      )}
    </div>
  )
}
