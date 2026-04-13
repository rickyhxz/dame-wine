import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { TastingActions } from '@/components/TastingActions'

function TypeBadge({ type }: { type: string }) {
  return <span className={`wine-badge wine-badge-${type}`}>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
}

function Stars({ rating }: { rating: number }) {
  return <span className="text-sm text-gold">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

export default async function MyListPage() {
  const session = await getSession()

  const tastings = await db.tasting.findMany({
    where: { userId: session!.userId },
    include: { wine: true },
    orderBy: { createdAt: 'desc' },
  })

  const wishlist = tastings.filter((t) => t.status === 'WISHLIST')
  const tasted = tastings.filter((t) => t.status === 'TASTED')

  return (
    <div>
      <h1 className="text-2xl font-bold text-brown mb-6">My List</h1>

      {tastings.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-lg mb-2">Your list is empty</p>
          <p className="text-sm">
            Browse the{' '}
            <Link href="/wines" className="text-wine hover:underline">
              wine catalog
            </Link>{' '}
            and add some to your wishlist.
          </p>
        </div>
      )}

      {tasted.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            Tasted ({tasted.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tasted.map((t) => (
              <div key={t.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link
                    href={`/wines/${t.wine.id}`}
                    className="font-semibold text-brown hover:text-wine transition-colors leading-tight"
                  >
                    {t.wine.name}
                  </Link>
                  <TypeBadge type={t.wine.type} />
                </div>

                <p className="text-xs text-muted mb-1">{t.wine.variety} · {t.wine.region}</p>
                {t.wine.year && <p className="text-xs text-muted mb-2">{t.wine.year}</p>}

                {t.rating && <Stars rating={t.rating} />}
                {t.comment && (
                  <p className="text-sm text-brown italic mt-2 mb-3">"{t.comment}"</p>
                )}
                {t.tastedAt && (
                  <p className="text-xs text-muted mb-3">
                    Tasted {new Date(t.tastedAt).toLocaleDateString()}
                  </p>
                )}

                <div className="border-t border-border pt-3 mt-3">
                  <TastingActions
                    wineId={t.wine.id}
                    tasting={{ status: t.status, rating: t.rating, comment: t.comment }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {wishlist.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            Wishlist ({wishlist.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlist.map((t) => (
              <div key={t.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link
                    href={`/wines/${t.wine.id}`}
                    className="font-semibold text-brown hover:text-wine transition-colors leading-tight"
                  >
                    {t.wine.name}
                  </Link>
                  <TypeBadge type={t.wine.type} />
                </div>

                <p className="text-xs text-muted mb-1">{t.wine.variety} · {t.wine.region}</p>
                {t.wine.year && <p className="text-xs text-muted mb-3">{t.wine.year}</p>}

                <TastingActions
                  wineId={t.wine.id}
                  tasting={{ status: t.status, rating: t.rating, comment: t.comment }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
