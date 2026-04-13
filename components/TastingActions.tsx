'use client'

import { useActionState, useState } from 'react'
import { addToWishlistAction, markTastedAction, removeTastingAction } from '@/app/actions'

interface TastingState {
  status: string
  rating: number | null
  comment: string | null
}

interface Props {
  wineId: number
  tasting: TastingState | null
}

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl transition-colors ${n <= value ? 'star' : 'star-empty'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function TastingActions({ wineId, tasting }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(tasting?.rating ?? 0)
  const [state, formAction, pending] = useActionState(markTastedAction, null as { error: string } | null)

  if (!tasting) {
    return (
      <form action={addToWishlistAction.bind(null, wineId)}>
        <button
          type="submit"
          className="w-full bg-wine text-white rounded-lg py-2 text-sm font-semibold hover:bg-wine-dark transition-colors"
        >
          + Add to Wishlist
        </button>
      </form>
    )
  }

  if (tasting.status === 'WISHLIST') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gold uppercase tracking-wide">
            On your wishlist
          </span>
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-wine text-white rounded-lg py-2 text-sm font-semibold hover:bg-wine-dark transition-colors"
          >
            Mark as Tasted
          </button>
        ) : (
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="wineId" value={wineId} />
            <input type="hidden" name="rating" value={rating} />

            <div>
              <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Rating</label>
              <Stars value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">Notes</label>
              <textarea
                name="comment"
                defaultValue={tasting.comment ?? ''}
                rows={3}
                placeholder="How did it taste?"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30 resize-none"
              />
            </div>

            {state?.error && (
              <p className="text-xs text-red-600">{state.error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 bg-wine text-white rounded-lg py-2 text-sm font-semibold hover:bg-wine-dark transition-colors disabled:opacity-60"
              >
                {pending ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-muted hover:text-brown border border-border rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <form action={removeTastingAction.bind(null, wineId)}>
          <button type="submit" className="text-xs text-muted hover:text-wine transition-colors">
            Remove from list
          </button>
        </form>
      </div>
    )
  }

  // TASTED
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-wine uppercase tracking-wide">Tasted</span>
        {tasting.rating && (
          <span className="text-gold text-sm">{'★'.repeat(tasting.rating)}{'☆'.repeat(5 - tasting.rating)}</span>
        )}
      </div>

      {tasting.comment && (
        <p className="text-sm text-brown italic">"{tasting.comment}"</p>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-muted hover:text-wine transition-colors"
        >
          Edit notes
        </button>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="wineId" value={wineId} />
          <input type="hidden" name="rating" value={rating} />

          <div>
            <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Rating</label>
            <Stars value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">Notes</label>
            <textarea
              name="comment"
              defaultValue={tasting.comment ?? ''}
              rows={3}
              placeholder="How did it taste?"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30 resize-none"
            />
          </div>

          {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-wine text-white rounded-lg py-2 text-sm font-semibold hover:bg-wine-dark transition-colors disabled:opacity-60"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-muted hover:text-brown border border-border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
