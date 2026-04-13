'use client'

import { useActionState, useRef, useState } from 'react'
import Image from 'next/image'
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
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) { setPreview(null); return }
    setPreview(URL.createObjectURL(file))
  }

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

          {/* Label image upload */}
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Label Image</label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div
                className="w-24 h-32 rounded-lg border-2 border-dashed border-border bg-cream flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-wine/40 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <Image src={preview} alt="Label preview" width={96} height={128} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <span className="text-xs text-muted text-center px-2">Click to upload</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  name="labelImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-wine hover:underline font-medium"
                >
                  {preview ? 'Change image' : 'Choose photo'}
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="block text-xs text-muted hover:text-red-500 mt-1 transition-colors"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-muted mt-2">JPG, PNG, or WebP · max 5 MB</p>
              </div>
            </div>
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
