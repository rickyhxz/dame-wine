import Link from 'next/link'
import { Suspense } from 'react'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { FilterBar } from '@/components/FilterBar'
import { TastingActions } from '@/components/TastingActions'

function TypeBadge({ type }: { type: string }) {
  return <span className={`wine-badge wine-badge-${type}`}>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
}

function Stars({ rating }: { rating: number }) {
  return <span className="text-xs text-gold">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

interface PageProps {
  searchParams: Promise<{ type?: string; variety?: string; region?: string; year?: string }>
}

async function WineList({ searchParams }: PageProps) {
  const session = await getSession()
  const params = await searchParams

  const wines = await db.wine.findMany({
    where: {
      ...(params.type ? { type: params.type } : {}),
      ...(params.variety ? { variety: { contains: params.variety } } : {}),
      ...(params.region ? { region: { contains: params.region } } : {}),
      ...(params.year ? { year: parseInt(params.year) } : {}),
    },
    include: {
      tastings: true,
    },
    orderBy: [{ type: 'asc' }, { variety: 'asc' }, { name: 'asc' }],
  })

  const userTastingMap = new Map(
    wines
      .flatMap((w) => w.tastings)
      .filter((t) => t.userId === session!.userId)
      .map((t) => [t.wineId, t])
  )

  // Count friends who tasted each wine
  const friendTastingsMap = new Map(
    wines.map((w) => [
      w.id,
      w.tastings.filter((t) => t.userId !== session!.userId && t.status === 'TASTED').length,
    ])
  )

  if (wines.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-lg mb-2">No wines found</p>
        <p className="text-sm">
          Try removing some filters, or{' '}
          <Link href="/wines/add" className="text-wine hover:underline">
            add a new wine
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {wines.map((wine) => {
        const myTasting = userTastingMap.get(wine.id)
        const friendCount = friendTastingsMap.get(wine.id) ?? 0

        return (
          <div key={wine.id} className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Link
                  href={`/wines/${wine.id}`}
                  className="font-semibold text-brown hover:text-wine transition-colors leading-tight"
                >
                  {wine.name}
                </Link>
                <TypeBadge type={wine.type} />
              </div>

              <p className="text-sm text-muted">{wine.variety}</p>
              <p className="text-xs text-muted mt-0.5">
                {wine.region}, {wine.country}
                {wine.year ? ` · ${wine.year}` : ''}
              </p>

              {myTasting?.status === 'TASTED' && myTasting.rating && (
                <div className="mt-2">
                  <Stars rating={myTasting.rating} />
                </div>
              )}

              {friendCount > 0 && (
                <p className="text-xs text-muted mt-1.5">
                  {friendCount} friend{friendCount > 1 ? 's' : ''} tasted this
                </p>
              )}
            </div>

            <TastingActions
              wineId={wine.id}
              tasting={myTasting ? { status: myTasting.status, rating: myTasting.rating, comment: myTasting.comment } : null}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function WinesPage({ searchParams }: PageProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brown">Wine Cellar</h1>
        <Link
          href="/wines/add"
          className="text-sm bg-wine text-white px-4 py-2 rounded-lg hover:bg-wine-dark transition-colors font-medium"
        >
          + Add Wine
        </Link>
      </div>

      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center py-16 text-muted text-sm">Loading wines…</div>
        }
      >
        <WineList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
