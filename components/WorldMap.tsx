'use client'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – react-simple-maps has no bundled types
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'

// ISO numeric codes for wine-producing countries we track
const COUNTRY_ISO: Record<string, string> = {
  'France': '250',
  'Italy': '380',
  'Spain': '724',
  'Portugal': '620',
  'Germany': '276',
  'Austria': '040',
  'Hungary': '348',
  'USA': '840',
  'Australia': '036',
  'New Zealand': '554',
  'Argentina': '032',
  'Chile': '152',
  'South Africa': '710',
  'Georgia': '268',
  'Greece': '300',
}

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface Props {
  tastedCountries: string[]
}

export function WorldMap({ tastedCountries }: Props) {
  const tastedIsoCodes = new Set(
    tastedCountries.map((c) => COUNTRY_ISO[c]).filter(Boolean)
  )

  return (
    <div className="w-full rounded-xl overflow-hidden bg-[#e8f4f8]">
      <ComposableMap
        projection="geoNaturalEarth1"
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const isoNum = String(geo.id)
                const isTasted = tastedIsoCodes.has(isoNum)
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isTasted ? '#722f37' : '#d4c5bb'}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: isTasted ? '#a0404c' : '#c0b0a8', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <div className="flex items-center gap-4 px-4 py-2 bg-card border-t border-border text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-wine inline-block" />
          Tasted from here
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#d4c5bb] inline-block" />
          Not yet
        </span>
      </div>
    </div>
  )
}
