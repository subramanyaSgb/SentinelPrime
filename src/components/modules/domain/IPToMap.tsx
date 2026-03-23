import { useState, useCallback } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'
import { lookupIP } from '@/services/ipapi'
import type { IPGeoResult } from '@/services/ipapi'

/**
 * IPToMap — Phase 4.10
 * Geolocates IP addresses with interactive map via OpenStreetMap embed.
 */

const spec = getModuleById('ip-to-map')!

interface IPMapResults {
  geo: IPGeoResult
  mapUrl: string
  osmUrl: string
  googleMapsUrl: string
}

export function IPToMap() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<IPMapResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleExecute = useCallback(async (inputs: Record<string, string>) => {
    const ip = inputs.ip?.trim()
    if (!ip) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setAiResult(null)

    try {
      const result = await lookupIP(ip)

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        const geo = result.data
        const lat = String(geo.lat)
        const lon = String(geo.lon)
        setResults({
          geo,
          mapUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${String(geo.lon - 0.05)},${String(geo.lat - 0.05)},${String(geo.lon + 0.05)},${String(geo.lat + 0.05)}&layer=mapnik&marker=${lat},${lon}`,
          osmUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`,
          googleMapsUrl: `https://www.google.com/maps?q=${lat},${lon}`,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'LOOKUP FAILED')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCopy = useCallback(() => {
    if (!results) return
    void navigator.clipboard.writeText(JSON.stringify(results.geo, null, 2))
  }, [results])

  const resultsNode = results ? <IPMapResultsDisplay results={results} /> : null

  return (
    <ModuleCard
      spec={spec}
      onExecute={handleExecute}
      isLoading={isLoading}
      results={resultsNode}
      error={error}
      aiResult={aiResult}
      onCopy={results ? handleCopy : undefined}
    />
  )
}

function IPMapResultsDisplay({ results }: { results: IPMapResults }) {
  const { geo } = results

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Map embed */}
      <div
        style={{
          border: '1px solid var(--phosphor-faint)',
          position: 'relative',
          overflow: 'hidden',
          height: '250px',
        }}
      >
        <iframe
          title="IP Location Map"
          src={results.mapUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            filter: 'invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2)',
          }}
        />
        {/* Overlay corners for PHANTOM GRID feel */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '4px 8px',
            background: 'rgba(2, 8, 2, 0.7)',
            fontSize: '9px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
          }}
        >
          GEOLOCATION // {String(geo.lat)}, {String(geo.lon)} // {geo.city}, {geo.country}
        </div>
      </div>

      {/* Map links */}
      <div className="flex items-center gap-2">
        <a
          href={results.osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '4px 8px',
            border: '1px solid var(--phosphor-faint)',
            color: 'var(--phosphor)',
            textDecoration: 'none',
            fontSize: '9px',
            textTransform: 'uppercase',
          }}
        >
          ▶ OPENSTREETMAP ↗
        </a>
        <a
          href={results.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '4px 8px',
            border: '1px solid var(--phosphor-faint)',
            color: 'var(--phosphor)',
            textDecoration: 'none',
            fontSize: '9px',
            textTransform: 'uppercase',
          }}
        >
          ▶ GOOGLE MAPS ↗
        </a>
      </div>

      {/* Geo data */}
      <div
        style={{
          background: 'var(--bg-deep)',
          border: '1px solid var(--phosphor-faint)',
          padding: '8px 10px',
        }}
      >
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
          IP GEOLOCATION DATA
        </div>
        <DataRow label="IP ADDRESS" value={geo.query} />
        <DataRow label="COUNTRY" value={`${geo.country} (${geo.countryCode})`} />
        <DataRow label="REGION" value={geo.regionName} />
        <DataRow label="CITY" value={geo.city} />
        <DataRow label="ZIP" value={geo.zip || 'N/A'} />
        <DataRow label="LAT / LON" value={`${String(geo.lat)} / ${String(geo.lon)}`} />
        <DataRow label="TIMEZONE" value={geo.timezone} />
        <DataRow label="ISP" value={geo.isp} />
        <DataRow label="ORG" value={geo.org} />
        <DataRow label="AS NUMBER" value={geo.as} />
        <DataRow label="PROXY/VPN" value={geo.proxy ? '⚠ DETECTED' : '✓ NOT DETECTED'} highlight={geo.proxy} />
        <DataRow label="HOSTING" value={geo.hosting ? '● YES' : '○ NO'} />
        <DataRow label="MOBILE" value={geo.mobile ? '● YES' : '○ NO'} />
      </div>
    </div>
  )
}

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '10px',
        padding: '2px 0',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ color: 'var(--phosphor-dim)', width: '100px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--phosphor-dim)' }}>//</span>
      <span style={{ color: highlight ? 'var(--amber)' : 'var(--phosphor)', wordBreak: 'break-all' }}>
        {value}
      </span>
    </div>
  )
}
