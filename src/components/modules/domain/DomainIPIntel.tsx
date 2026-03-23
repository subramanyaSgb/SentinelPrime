import { useState, useCallback } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'
import { lookupIP } from '@/services/ipapi'
import { searchCertificates } from '@/services/crtsh'
import type { IPGeoResult } from '@/services/ipapi'
import type { CertResult } from '@/services/crtsh'

/**
 * DomainIPIntel — Phase 4.3
 * WHOIS, DNS, reverse IP, SSL cert, and geolocation lookups.
 */

const spec = getModuleById('domain-ip-intel')!

interface DomainResults {
  ipGeo: IPGeoResult | null
  ipGeoError: string | null
  certs: CertResult[] | null
  certsError: string | null
  dnsRecords: DNSRecord[] | null
}

interface DNSRecord {
  type: string
  value: string
}

export function DomainIPIntel() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<DomainResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleExecute = useCallback(async (inputs: Record<string, string>) => {
    const target = inputs.target?.trim()
    if (!target) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setAiResult(null)

    try {
      // Determine if input is IP or domain
      const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target)

      const [ipResult, certResult] = await Promise.all([
        lookupIP(isIP ? target : target), // ip-api also resolves domains
        isIP ? Promise.resolve({ data: null, error: null }) : searchCertificates(target),
      ])

      // DNS lookup via DNS-over-HTTPS
      let dnsRecords: DNSRecord[] | null = null
      if (!isIP) {
        try {
          const dnsResponse = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(target)}&type=A`
          )
          if (dnsResponse.ok) {
            const dnsData = (await dnsResponse.json()) as { Answer?: { type: number; data: string }[] }
            dnsRecords = (dnsData.Answer ?? []).map((r) => ({
              type: r.type === 1 ? 'A' : r.type === 28 ? 'AAAA' : r.type === 5 ? 'CNAME' : String(r.type),
              value: r.data,
            }))
          }
        } catch {
          // DNS lookup is best-effort
        }
      }

      setResults({
        ipGeo: ipResult.data,
        ipGeoError: ipResult.error,
        certs: certResult.data,
        certsError: certResult.error,
        dnsRecords,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNKNOWN ERROR')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCopy = useCallback(() => {
    if (!results) return
    void navigator.clipboard.writeText(JSON.stringify(results, null, 2))
  }, [results])

  const resultsNode = results ? <DomainResultsDisplay results={results} /> : null

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

function DomainResultsDisplay({ results }: { results: DomainResults }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* IP Geolocation */}
      {results.ipGeo && (
        <ResultSection title="IP GEOLOCATION">
          <DataRow label="IP" value={results.ipGeo.query} />
          <DataRow label="COUNTRY" value={`${results.ipGeo.country} (${results.ipGeo.countryCode})`} />
          <DataRow label="REGION" value={results.ipGeo.regionName} />
          <DataRow label="CITY" value={results.ipGeo.city} />
          <DataRow label="COORDINATES" value={`${String(results.ipGeo.lat)}, ${String(results.ipGeo.lon)}`} />
          <DataRow label="TIMEZONE" value={results.ipGeo.timezone} />
          <DataRow label="ISP" value={results.ipGeo.isp} />
          <DataRow label="ORG" value={results.ipGeo.org} />
          <DataRow label="AS" value={results.ipGeo.as} />
          <DataRow label="PROXY/VPN" value={results.ipGeo.proxy ? '⚠ YES' : '✓ NO'} highlight={results.ipGeo.proxy} />
          <DataRow label="HOSTING" value={results.ipGeo.hosting ? '● YES' : '○ NO'} />
          <DataRow label="MOBILE" value={results.ipGeo.mobile ? '● YES' : '○ NO'} />
        </ResultSection>
      )}
      {results.ipGeoError && (
        <div style={{ fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase' }}>
          ⚠ IP LOOKUP: {results.ipGeoError}
        </div>
      )}

      {/* DNS Records */}
      {results.dnsRecords && results.dnsRecords.length > 0 && (
        <ResultSection title={`DNS RECORDS // ${String(results.dnsRecords.length)} FOUND`}>
          {results.dnsRecords.map((rec, i) => (
            <DataRow key={`dns-${String(i)}`} label={rec.type} value={rec.value} />
          ))}
        </ResultSection>
      )}

      {/* SSL Certificates */}
      {results.certs && results.certs.length > 0 && (
        <ResultSection title={`SSL CERTIFICATES // ${String(results.certs.length)} FOUND`}>
          {results.certs.slice(0, 15).map((cert, i) => (
            <div
              key={`cert-${String(i)}`}
              style={{
                padding: '4px 0',
                borderBottom: '1px solid var(--phosphor-faint)',
                fontSize: '9px',
                color: 'var(--phosphor-dim)',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ color: 'var(--phosphor)' }}>{cert.common_name}</span>
              {' // '}
              {cert.not_before} → {cert.not_after}
              {cert.name_value !== cert.common_name && (
                <>
                  {' // SAN: '}
                  <span style={{ opacity: 0.6 }}>{cert.name_value}</span>
                </>
              )}
            </div>
          ))}
          {results.certs.length > 15 && (
            <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', opacity: 0.5, marginTop: '4px' }}>
              +{results.certs.length - 15} MORE CERTIFICATES
            </div>
          )}
        </ResultSection>
      )}
      {results.certsError && (
        <div style={{ fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase' }}>
          ⚠ CERT LOOKUP: {results.certsError}
        </div>
      )}
    </div>
  )
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg-deep)',
        border: '1px solid var(--phosphor-faint)',
        padding: '8px 10px',
      }}
    >
      <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
        {title}
      </div>
      {children}
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
