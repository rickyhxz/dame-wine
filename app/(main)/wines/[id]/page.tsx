import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { TastingActions } from '@/components/TastingActions'

function TypeBadge({ type }: { type: string }) {
  return <span className={`wine-badge wine-badge-${type}`}>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-gold">
      {'★'.repeat(rating)}
      <span className="text-border">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WineDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await getSession()

  const wine = await db.wine.findUnique({
    where: { id: parseInt(id) },
    include: {
      tastings: {
        include: { user: true },
        orderBy: { tastedAt: 'desc' },
      },
    },
  })

  if (!wine) notFound()

  const myTasting = wine.tastings.find((t) => t.userId === session!.userId)
  const friendTastings = wine.tastings.filter(
    (t) => t.userId !== session!.userId && t.status === 'TASTED'
  )
  const wishlistedBy = wine.tastings.filter(
    (t) => t.userId !== session!.userId && t.status === 'WISHLIST'
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6 text-sm">
        <Link href="/wines" className="text-muted hover:text-wine">
          ← Wines
        </Link>
      </div>

      {/* Wine header */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex gap-5">
          {/* Label image */}
          {wine.labelImageUrl && (
            <div className="shrink-0">
              <Image
                src={wine.labelImageUrl}
                alt={`${wine.name} label`}
                width={100}
                height={140}
                className="w-24 h-36 object-cover rounded-lg border border-border shadow-sm"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl font-bold text-brown leading-tight">{wine.name}</h1>
              <TypeBadge type={wine.type} />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted mb-4">
              <span>{wine.variety}</span>
              <span>{wine.region}, {wine.country}</span>
              {wine.year && <span>{wine.year}</span>}
            </div>
          </div>
        </div>

        {wine.description && (
          <div className="border-t border-border pt-4 mt-4">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Tasting Notes
            </h2>
            <p className="text-sm text-brown leading-relaxed">{wine.description}</p>
          </div>
        )}
      </div>

      {/* My tasting */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
          Your Tasting
        </h2>
        <TastingActions
          wineId={wine.id}
          tasting={
            myTasting
              ? { status: myTasting.status, rating: myTasting.rating, comment: myTasting.comment }
              : null
          }
        />
      </div>

      {/* Friends' tastings */}
      {friendTastings.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            Friends&apos; Tastings
          </h2>
          <div className="space-y-4">
            {friendTastings.map((t) => (
              <div key={t.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-wine/10 flex items-center justify-center text-wine font-bold text-sm flex-shrink-0">
                  {t.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-brown">{t.user.name}</span>
                    {t.rating && <Stars rating={t.rating} />}
                    {t.tastedAt && (
                      <span className="text-xs text-muted">
                        {new Date(t.tastedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {t.comment && <p className="text-sm text-muted italic">"{t.comment}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wishlisted by */}
      {wishlistedBy.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Also on their wishlist
          </h2>
          <div className="flex flex-wrap gap-2">
            {wishlistedBy.map((t) => (
              <span
                key={t.id}
                className="text-xs bg-cream border border-border rounded-full px-3 py-1 text-brown"
              >
                {t.user.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
