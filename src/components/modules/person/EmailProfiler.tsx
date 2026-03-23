import { useState, useCallback } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'
import { checkBreaches, getHIBPUrl } from '@/services/hibp'
import { lookupGravatar, getAvatarUrl } from '@/services/gravatar'
import type { BreachResult } from '@/services/hibp'
import type { GravatarProfile } from '@/services/gravatar'

/**
 * EmailProfiler — Phase 4.1
 * Aggregates breach history, Gravatar profile, and account intelligence for any email.
 */

const spec = getModuleById('email-profiler')!

interface EmailResults {
  breaches: BreachResult[] | null
  breachError: string | null
  gravatar: GravatarProfile | null
  avatarUrl: string | null
  hibpUrl: string
}

export function EmailProfiler() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<EmailResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleExecute = useCallback(async (inputs: Record<string, string>) => {
    const email = inputs.email?.trim()
    if (!email) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setAiResult(null)

    try {
      const [breachResult, gravatarResult, avatarUrl] = await Promise.all([
        checkBreaches(email),
        lookupGravatar(email),
        getAvatarUrl(email),
      ])

      setResults({
        breaches: breachResult.data,
        breachError: breachResult.error,
        gravatar: gravatarResult.data,
        avatarUrl,
        hibpUrl: getHIBPUrl(email),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNKNOWN ERROR')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCopy = useCallback(() => {
    if (!results) return
    const text = JSON.stringify(results, null, 2)
    void navigator.clipboard.writeText(text)
  }, [results])

  const resultsNode = results ? <EmailResultsDisplay results={results} /> : null

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

function EmailResultsDisplay({ results }: { results: EmailResults }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Gravatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {results.avatarUrl && (
          <img
            src={results.avatarUrl}
            alt="Avatar"
            style={{
              width: '48px',
              height: '48px',
              border: '1px solid var(--phosphor-faint)',
              filter: 'grayscale(50%) brightness(1.2)',
            }}
          />
        )}
        <div>
          {results.gravatar ? (
            <>
              <div style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
                {results.gravatar.displayName || 'NO DISPLAY NAME'}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)' }}>
                GRAVATAR PROFILE FOUND // {results.gravatar.accounts?.length ?? 0} LINKED ACCOUNTS
              </div>
            </>
          ) : (
            <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase' }}>
              NO GRAVATAR PROFILE FOUND
            </div>
          )}
        </div>
      </div>

      {/* Gravatar linked accounts */}
      {results.gravatar?.accounts && results.gravatar.accounts.length > 0 && (
        <div>
          <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            LINKED ACCOUNTS
          </div>
          {results.gravatar.accounts.map((acc, i) => (
            <div
              key={`acc-${String(i)}`}
              style={{
                fontSize: '10px',
                color: 'var(--phosphor-dim)',
                padding: '2px 0',
                textTransform: 'uppercase',
              }}
            >
              ◇ {acc.shortname} // {acc.username} //&nbsp;
              <a
                href={acc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--phosphor)' }}
              >
                LINK ↗
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Breaches */}
      <div>
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
          BREACH RESULTS
        </div>

        {results.breachError ? (
          <div>
            <div style={{ fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '4px' }}>
              ⚠ {results.breachError}
            </div>
            <a
              href={results.hibpUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '10px',
                color: 'var(--phosphor)',
                textDecoration: 'underline',
                textTransform: 'uppercase',
              }}
            >
              ▶ CHECK MANUALLY ON HIBP ↗
            </a>
          </div>
        ) : results.breaches && results.breaches.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--red-critical)', textTransform: 'uppercase' }}>
              ⚠ FOUND IN {results.breaches.length} BREACH{results.breaches.length !== 1 ? 'ES' : ''}
            </div>
            {results.breaches.slice(0, 20).map((breach) => (
              <div
                key={breach.Name}
                style={{
                  padding: '6px 8px',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--phosphor-faint)',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                }}
              >
                <div style={{ color: 'var(--phosphor)', marginBottom: '2px' }}>
                  {breach.Title} // {breach.Domain}
                </div>
                <div style={{ color: 'var(--phosphor-dim)' }}>
                  DATE: {breach.BreachDate} // RECORDS: {breach.PwnCount?.toLocaleString()} // VERIFIED: {breach.IsVerified ? '✓' : '✕'}
                </div>
                {breach.DataClasses && (
                  <div style={{ color: 'var(--phosphor-dim)', opacity: 0.6, marginTop: '2px' }}>
                    DATA: {breach.DataClasses.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase' }}>
            ✓ NO BREACHES FOUND — EMAIL IS CLEAN
          </div>
        )}
      </div>
    </div>
  )
}
