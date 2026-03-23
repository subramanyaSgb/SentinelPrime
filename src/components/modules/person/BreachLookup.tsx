import { useState, useCallback } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'
import { checkBreaches, getHIBPUrl } from '@/services/hibp'
import type { BreachResult } from '@/services/hibp'

/**
 * BreachLookup — Phase 4.2
 * Dedicated breach lookup via HaveIBeenPwned.
 */

const spec = getModuleById('breach-lookup')!

export function BreachLookup() {
  const [isLoading, setIsLoading] = useState(false)
  const [breaches, setBreaches] = useState<BreachResult[] | null>(null)
  const [hibpUrl, setHibpUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [isLinkOutMode, setIsLinkOutMode] = useState(false)

  const handleExecute = useCallback(async (inputs: Record<string, string>) => {
    const email = inputs.email?.trim()
    if (!email) return

    setIsLoading(true)
    setError(null)
    setBreaches(null)
    setAiResult(null)
    setIsLinkOutMode(false)
    setHibpUrl(getHIBPUrl(email))

    try {
      const result = await checkBreaches(email)

      if (result.error && result.error.includes('API_KEY_REQUIRED')) {
        setIsLinkOutMode(true)
        setError(null)
      } else if (result.error) {
        setError(result.error)
      } else {
        setBreaches(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNKNOWN ERROR')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCopy = useCallback(() => {
    if (!breaches) return
    void navigator.clipboard.writeText(JSON.stringify(breaches, null, 2))
  }, [breaches])

  const resultsNode = (breaches || isLinkOutMode) ? (
    <BreachResultsDisplay breaches={breaches} hibpUrl={hibpUrl} isLinkOut={isLinkOutMode} />
  ) : null

  return (
    <ModuleCard
      spec={spec}
      onExecute={handleExecute}
      isLoading={isLoading}
      results={resultsNode}
      error={error}
      aiResult={aiResult}
      onCopy={breaches ? handleCopy : undefined}
    />
  )
}

function BreachResultsDisplay({
  breaches,
  hibpUrl,
  isLinkOut,
}: {
  breaches: BreachResult[] | null
  hibpUrl: string
  isLinkOut: boolean
}) {
  if (isLinkOut) {
    return (
      <div>
        <div style={{ fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '8px' }}>
          ⚠ HIBP REQUIRES API KEY FOR DIRECT LOOKUPS
        </div>
        <a
          href={hibpUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            border: '1px solid var(--phosphor)',
            color: 'var(--phosphor)',
            textDecoration: 'none',
            fontSize: '11px',
            textTransform: 'uppercase',
          }}
        >
          ▶ CHECK ON HAVEIBEENPWNED.COM ↗
        </a>
        <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', marginTop: '6px', textTransform: 'uppercase' }}>
          TIP: GET AN API KEY ($3.50/MONTH) FOR DIRECT LOOKUPS
        </div>
      </div>
    )
  }

  if (!breaches || breaches.length === 0) {
    return (
      <div style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
        ✓ NO BREACHES FOUND — EMAIL APPEARS CLEAN
      </div>
    )
  }

  // Summary stats
  const totalRecords = breaches.reduce((sum, b) => sum + (b.PwnCount || 0), 0)
  const verifiedCount = breaches.filter((b) => b.IsVerified).length
  const sensitiveCount = breaches.filter((b) => b.IsSensitive).length
  const allDataClasses = [...new Set(breaches.flatMap((b) => b.DataClasses || []))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Summary */}
      <div
        style={{
          padding: '8px 10px',
          background: 'rgba(255, 32, 32, 0.05)',
          border: '1px solid var(--red-critical)',
          fontSize: '10px',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ color: 'var(--red-critical)', marginBottom: '4px' }}>
          ⚠ FOUND IN {breaches.length} BREACH{breaches.length !== 1 ? 'ES' : ''} // {totalRecords.toLocaleString()} TOTAL RECORDS EXPOSED
        </div>
        <div style={{ color: 'var(--phosphor-dim)' }}>
          VERIFIED: {verifiedCount}/{breaches.length} // SENSITIVE: {sensitiveCount}
        </div>
        <div style={{ color: 'var(--phosphor-dim)', marginTop: '2px', fontSize: '9px' }}>
          DATA TYPES: {allDataClasses.slice(0, 10).join(', ')}{allDataClasses.length > 10 ? ` +${allDataClasses.length - 10} MORE` : ''}
        </div>
      </div>

      {/* Breach list */}
      {breaches.map((breach) => (
        <div
          key={breach.Name}
          style={{
            padding: '6px 8px',
            background: 'var(--bg-deep)',
            border: `1px solid ${breach.IsSensitive ? 'var(--red-critical)' : 'var(--phosphor-faint)'}`,
            fontSize: '9px',
            textTransform: 'uppercase',
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--phosphor)' }}>{breach.Title}</span>
            <span style={{ color: 'var(--phosphor-dim)' }}>{breach.BreachDate}</span>
          </div>
          <div style={{ color: 'var(--phosphor-dim)', marginTop: '2px' }}>
            DOMAIN: {breach.Domain} // RECORDS: {breach.PwnCount?.toLocaleString()} //
            {breach.IsVerified ? ' ✓ VERIFIED' : ' ✕ UNVERIFIED'}
            {breach.IsSensitive ? ' // ⚠ SENSITIVE' : ''}
          </div>
          {breach.DataClasses && (
            <div style={{ color: 'var(--phosphor-dim)', opacity: 0.6, marginTop: '2px' }}>
              DATA: {breach.DataClasses.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
