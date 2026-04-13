import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { WorldMap } from '@/components/WorldMap'

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  const weeks = Math.floor(days / 7)
  if (minutes < 2) return 'just now'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 text-center">
      <p className="text-3xl font-bold text-wine">{value}</p>
      <p className="text-xs text-muted mt-1 uppercase tracking-wide font-semibold">{label}</p>
    </div>
  )
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-brown w-40 truncate shrink-0">{label}</span>
      <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-wine rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted w-4 text-right shrink-0">{count}</span>
    </div>
  )
}

export default async function HomePage() {
  const session = await getSession()

  const tastings = await db.tasting.findMany({
    where: { userId: session!.userId, status: 'TASTED' },
    include: { wine: true },
    orderBy: { tastedAt: 'desc' },
  })

  const wishlistCount = await db.tasting.count({
    where: { userId: session!.userId, status: 'WISHLIST' },
  })

  const friendTastings = await db.tasting.findMany({
    where: { status: 'TASTED', userId: { not: session!.userId } },
    include: { user: true, wine: true },
    orderBy: { tastedAt: 'desc' },
    take: 8,
  })

  const recentEvents = await db.tastingEvent.findMany({
    include: { creator: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  // Aggregate stats
  const varietyCounts: Record<string, number> = {}
  const regionCounts: Record<string, number> = {}
  const countryCounts: Record<string, number> = {}
  const typeCounts: Record<string, number> = {}

  for (const t of tastings) {
    varietyCounts[t.wine.variety] = (varietyCounts[t.wine.variety] || 0) + 1
    regionCounts[t.wine.region] = (regionCounts[t.wine.region] || 0) + 1
    countryCounts[t.wine.country] = (countryCounts[t.wine.country] || 0) + 1
    typeCounts[t.wine.type] = (typeCounts[t.wine.type] || 0) + 1
  }

  const topVarieties = Object.entries(varietyCounts).sort((a, b) => b[1] - a[1])
  const topRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])
  const tastedCountries = Object.keys(countryCounts)

  const maxVariety = topVarieties[0]?.[1] ?? 1
  const maxRegion = topRegions[0]?.[1] ?? 1

  // Average rating
  const rated = tastings.filter((t) => t.rating !== null)
  const avgRating =
    rated.length > 0
      ? (rated.reduce((s, t) => s + t.rating!, 0) / rated.length).toFixed(1)
      : null

  // Build merged friends activity timeline
  type TastingItem = {
    type: 'tasting'
    date: Date
    userName: string
    wineName: string
    rating: number | null
    comment: string | null
    wineId: number
  }
  type EventItem = {
    type: 'event'
    date: Date
    userName: string
    eventName: string
    eventId: number
  }
  type ActivityItem = TastingItem | EventItem

  const activityItems: ActivityItem[] = [
    ...friendTastings.map((t): TastingItem => ({
      type: 'tasting',
      date: t.tastedAt ?? t.createdAt,
      userName: t.user.name,
      wineName: t.wine.name,
      rating: t.rating,
      comment: t.comment,
      wineId: t.wine.id,
    })),
    ...recentEvents.map((e): EventItem => ({
      type: 'event',
      date: e.createdAt,
      userName: e.creator.name,
      eventName: e.name,
      eventId: e.id,
    })),
  ]
  activityItems.sort((a, b) => b.date.getTime() - a.date.getTime())
  const feedItems = activityItems.slice(0, 10)

  const TYPE_LABELS: Record<string, string> = {
    RED: 'Red', WHITE: 'White', ROSE: 'Rosé',
    SPARKLING: 'Sparkling', DESSERT: 'Dessert', FORTIFIED: 'Fortified',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted text-sm mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-brown">{session!.name}</h1>
        </div>
        <Link
          href="/wines"
          className="text-sm bg-wine text-white px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors font-medium"
        >
          Browse Wines
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Wines Tasted" value={tastings.length} />
        <StatCard label="Varieties" value={topVarieties.length} />
        <StatCard label="Regions" value={topRegions.length} />
        <StatCard label="Countries" value={topCountries.length} />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {avgRating && (
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-gold">{avgRating} <span className="text-gold text-xl">★</span></p>
            <p className="text-xs text-muted mt-1 uppercase tracking-wide font-semibold">Avg Rating</p>
          </div>
        )}
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-muted">{wishlistCount}</p>
          <p className="text-xs text-muted mt-1 uppercase tracking-wide font-semibold">On Wishlist</p>
        </div>
        {Object.entries(typeCounts).length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted uppercase tracking-wide font-semibold mb-2">By Type</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(typeCounts).map(([type, count]) => (
                <span key={type} className={`wine-badge wine-badge-${type}`}>
                  {TYPE_LABELS[type]} {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* World map */}
      {tastedCountries.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Countries Explored
          </h2>
          <WorldMap tastedCountries={tastedCountries} />
          <div className="flex flex-wrap gap-2 mt-3">
            {topCountries.map(([country, count]) => (
              <span
                key={country}
                className="text-xs bg-wine/10 text-wine border border-wine/20 rounded-full px-3 py-1 font-medium"
              >
                {country} · {count}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted">
          <p className="text-lg mb-1">No wines tasted yet</p>
          <p className="text-sm">
            <Link href="/wines" className="text-wine hover:underline">Browse the catalog</Link>
            {' '}and mark your first wine as tasted.
          </p>
        </div>
      )}

      {/* Variety & Region breakdown */}
      {tastings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
              Grape Varieties
            </h2>
            <div className="space-y-3">
              {topVarieties.map(([variety, count]) => (
                <BarRow key={variety} label={variety} count={count} max={maxVariety} />
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
              Regions
            </h2>
            <div className="space-y-3">
              {topRegions.map(([region, count]) => (
                <BarRow key={region} label={region} count={count} max={maxRegion} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent tastings */}
      {tastings.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Recent Tastings
          </h2>
          <div className="space-y-2">
            {tastings.slice(0, 5).map((t) => (
              <Link
                key={t.id}
                href={`/wines/${t.wine.id}`}
                className="flex items-center justify-between bg-card rounded-lg border border-border px-4 py-3 hover:border-wine/40 transition-colors"
              >
                <div>
                  <span className="text-sm font-medium text-brown">{t.wine.name}</span>
                  <span className="text-xs text-muted ml-2">{t.wine.variety} · {t.wine.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  {t.rating && (
                    <span className="text-gold text-sm">{'★'.repeat(t.rating)}</span>
                  )}
                  {t.tastedAt && (
                    <span className="text-xs text-muted">
                      {new Date(t.tastedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {tastings.length > 5 && (
            <Link href="/my-list" className="block text-center text-sm text-wine hover:underline mt-3">
              View all {tastings.length} tastings →
            </Link>
          )}
        </div>
      )}

      {/* Friends Activity Feed */}
      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Friends Activity
        </h2>
        {feedItems.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted text-sm">
            No friends activity yet — invite your crew to start tasting!
          </div>
        ) : (
          <div className="space-y-2">
            {feedItems.map((item, i) => (
              <div
                key={`${item.type}-${i}`}
                className="bg-card rounded-xl border border-border px-4 py-3 flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-wine/10 text-wine text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                  {item.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-sm text-brown leading-relaxed">
                  {item.type === 'tasting' ? (
                    <>
                      <span className="font-semibold">{item.userName}</span>
                      {' tasted '}
                      <Link href={`/wines/${item.wineId}`} className="font-semibold hover:text-wine transition-colors">
                        {item.wineName}
                      </Link>
                      {item.rating !== null && (
                        <span className="text-gold ml-1">{'★'.repeat(item.rating)}</span>
                      )}
                      {item.comment && (
                        <span className="text-muted italic ml-1">· &ldquo;{item.comment}&rdquo;</span>
                      )}
                      <span className="text-xs text-muted ml-2">{relativeTime(item.date)}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">{item.userName}</span>
                      {' created event '}
                      <Link href={`/events/${item.eventId}`} className="font-semibold hover:text-wine transition-colors">
                        {item.eventName}
                      </Link>
                      <span className="text-xs text-muted ml-2">{relativeTime(item.date)}</span>
                      <Link href={`/events/${item.eventId}`} className="text-wine ml-1 hover:underline text-xs">
                        →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
