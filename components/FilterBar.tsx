'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const WINE_TYPES = ['RED', 'WHITE', 'ROSE', 'SPARKLING', 'DESSERT', 'FORTIFIED']

const VARIETIES = [
  'Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Syrah / Shiraz', 'Grenache',
  'Tempranillo', 'Sangiovese', 'Malbec', 'Zinfandel / Primitivo', 'Nebbiolo',
  'Chardonnay', 'Sauvignon Blanc', 'Pinot Gris / Grigio', 'Riesling',
  'Gewurztraminer', 'Muscat / Moscato', 'Viognier', 'Chenin Blanc',
  'Touriga Nacional', 'Palomino', 'Blend',
]

const REGIONS = [
  'Bordeaux', 'Burgundy', 'Champagne', 'Rhône Valley', 'Loire Valley', 'Alsace',
  'Tuscany', 'Piedmont', 'Veneto', 'Friuli',
  'Rioja', 'Ribera del Duero', 'Penedès', 'Priorat', 'Jerez',
  'Mosel', 'Rhine', 'Douro', 'Alentejo', 'Tokaj',
  'Napa Valley', 'Sonoma', 'Willamette Valley',
  'Mendoza', 'Maipo Valley', 'Barossa Valley', 'Marlborough', 'Hawke\'s Bay',
]

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const currentType = searchParams.get('type') ?? ''
  const currentVariety = searchParams.get('variety') ?? ''
  const currentRegion = searchParams.get('region') ?? ''
  const currentYear = searchParams.get('year') ?? ''

  const hasFilters = currentType || currentVariety || currentRegion || currentYear

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">Type</label>
          <select
            value={currentType}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
          >
            <option value="">All types</option>
            {WINE_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">Variety</label>
          <select
            value={currentVariety}
            onChange={(e) => updateFilter('variety', e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
          >
            <option value="">All varieties</option>
            {VARIETIES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">Region</label>
          <select
            value={currentRegion}
            onChange={(e) => updateFilter('region', e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="w-24">
          <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">Year</label>
          <input
            type="number"
            value={currentYear}
            onChange={(e) => updateFilter('year', e.target.value)}
            placeholder="2019"
            min="1900"
            max="2099"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-brown bg-cream focus:outline-none focus:ring-2 focus:ring-wine/30"
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="text-sm text-muted hover:text-wine transition-colors py-2 whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
