import { useState, useCallback } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'
import { searchSnapshots, getSnapshotUrl } from '@/services/archiveorg'
import type { WaybackSnapshot } from '@/services/archiveorg'

/**
 * WaybackCrawler — Phase 4.9
 * Searches Internet Archive for historical snapshots of any URL.
 */

const spec = getModuleById('wayback-crawler')!

interface WaybackResults {
  url: string
  snapshots: WaybackSnapshot[]
  totalFound: number
}

function formatTimestamp(ts: string): string {
  // Format: YYYYMMDDHHmmss -> YYYY-MM-DD // HH:MM:SS
  if (ts.length >= 14) {
    return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)} // ${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}`
  }
  if (ts.length >= 8) {
    return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`
  }
  return ts
}

export function WaybackCrawler() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<WaybackResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleExecute = useCallback(async (inputs: Record<string, string>) => {
    let url = inputs.url?.trim()
    if (!url) return

    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    setIsLoading(true)
    setError(null)
    setResults(null)
    setAiResult(null)

    try {
      const result = await searchSnapshots(url, 100)

      if (result.error) {
        setError(result.error)
      } else {
        setResults({
          url,
          snapshots: result.data ?? [],
          totalFound: result.data?.length ?? 0,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SEARCH FAILED')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCopy = useCallback(() => {
    if (!results) return
    const text = results.snapshots
      .map((s) => `${formatTimestamp(s.timestamp)} | ${s.statuscode} | ${s.mimetype} | ${getSnapshotUrl(s.timestamp, s.original)}`)
      .join('\n')
    void navigator.clipboard.writeText(text)
  }, [results])

  const resultsNode = results ? <WaybackResultsDisplay results={results} /> : null

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

function WaybackResultsDisplay({ results }: { results: WaybackResults }) {
  if (results.snapshots.length === 0) {
    return (
      <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase' }}>
        ○ NO ARCHIVED SNAPSHOTS FOUND FOR THIS URL
      </div>
    )
  }

  // Timeline stats
  const firstSnapshot = results.snapshots[results.snapshots.length - 1]
  const lastSnapshot = results.snapshots[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
        {results.totalFound} SNAPSHOTS FOUND // FIRST: {firstSnapshot ? formatTimestamp(firstSnapshot.timestamp) : 'N/A'} // LAST: {lastSnapshot ? formatTimestamp(lastSnapshot.timestamp) : 'N/A'}
      </div>

      {/* Wayback Machine direct link */}
      <a
        href={`https://web.archive.org/web/*/${results.url}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '6px 12px',
          border: '1px solid var(--phosphor)',
          color: 'var(--phosphor)',
          textDecoration: 'none',
          fontSize: '10px',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        ▶ VIEW FULL TIMELINE ON ARCHIVE.ORG ↗
      </a>

      {/* Snapshot list */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {results.snapshots.slice(0, 50).map((snapshot, i) => {
          const snapshotUrl = getSnapshotUrl(snapshot.timestamp, snapshot.original)
          const statusColor =
            snapshot.statuscode.startsWith('2') ? 'var(--phosphor)' :
              snapshot.statuscode.startsWith('3') ? 'var(--amber)' :
                'var(--red-critical)'

          return (
            <a
              key={`snap-${String(i)}`}
              href={snapshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--phosphor-faint)',
                marginBottom: '2px',
                textDecoration: 'none',
                fontSize: '9px',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ color: 'var(--phosphor-dim)', width: '160px', flexShrink: 0 }}>
                {formatTimestamp(snapshot.timestamp)}
              </span>
              <span style={{ color: statusColor, width: '30px', flexShrink: 0 }}>
                {snapshot.statuscode}
              </span>
              <span style={{ color: 'var(--phosphor-dim)', width: '100px', flexShrink: 0 }}>
                {snapshot.mimetype}
              </span>
              <span style={{ color: 'var(--phosphor-dim)', opacity: 0.5 }}>
                {snapshot.length} B
              </span>
              <span style={{ color: 'var(--phosphor)', marginLeft: 'auto' }}>↗</span>
            </a>
          )
        })}
        {results.snapshots.length > 50 && (
          <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', padding: '8px', textAlign: 'center' }}>
            +{results.snapshots.length - 50} MORE SNAPSHOTS — VIEW ON ARCHIVE.ORG
          </div>
        )}
      </div>
    </div>
  )
}
