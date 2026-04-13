'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { addWineAction } from '@/app/actions'

const WINE_TYPES = [
  { value: 'RED', label: 'Red' },
  { value: 'WHITE', label: 'White' },
  { value: 'ROSE', label: 'Rosé' },
  { value: 'SPARKLING', label: 'Sparkling' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'FORTIFIED', label: 'Fortified' },
]

const VARIETIES = [
  'Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Syrah / Shiraz', 'Grenache',
  'Tempranillo', 'Sangiovese', 'Malbec', 'Zinfandel / Primitivo', 'Nebbiolo',
  'Barbera', 'Carmenère',
  'Chardonnay', 'Sauvignon Blanc', 'Pinot Gris / Grigio', 'Riesling',
  'Gewurztraminer', 'Muscat / Moscato', 'Viognier', 'Chenin Blanc', 'Verdejo',
  'Touriga Nacional', 'Palomino',
  'Blend',
]

export default function AddWinePage() {
  const [state, action, pending] = useActionState(addWineAction, null)

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/wines" className="text-muted hover:text-wine text-sm">
          ← Wines
        </Link>
        <span className="text-muted">/</span>
        <h1 className="text-2xl font-bold text-brown">Add a Wine</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        {state?.error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {state.error}
          </p>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1">
              Wine Name <span className="text-wine">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Château Margaux 2015"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Type <span className="text-wine">*</span>
              </label>
              <select
                name="type"
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
              >
                <option value="">Select type</option>
                {WINE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Variety <span className="text-wine">*</span>
              </label>
              <select
                name="variety"
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
              >
                <option value="">Select variety</option>
                {VARIETIES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Region <span className="text-wine">*</span>
              </label>
              <input
                name="region"
                type="text"
                required
                placeholder="e.g. Bordeaux"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">
                Country <span className="text-wine">*</span>
              </label>
              <input
                name="country"
                type="text"
                required
                placeholder="e.g. France"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown mb-1">Vintage Year</label>
            <input
              name="year"
              type="number"
              min="1900"
              max="2099"
              placeholder="e.g. 2019 (leave blank for NV)"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown mb-1">Description / Tasting Notes</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Appearance, nose, palate, finish…"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-wine text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-wine-dark transition-colors disabled:opacity-60"
          >
            {pending ? 'Adding wine…' : 'Add Wine'}
          </button>
        </form>
      </div>
    </div>
  )
}
