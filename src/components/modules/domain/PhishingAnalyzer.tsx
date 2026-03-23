import { useState, useCallback } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'
import { checkURL } from '@/services/urlhaus'

/**
 * PhishingAnalyzer — Phase 4.7
 * Analyzes suspicious URLs for phishing indicators.
 * Uses URLhaus API + heuristic analysis.
 */

const spec = getModuleById('phishing-analyzer')!

interface PhishingResults {
  url: string
  urlhaus: { found: boolean; threat: string; status: string; reference: string; tags: string[] } | null
  urlhausError: string | null
  heuristics: HeuristicResult[]
  riskScore: number
  linkOuts: { name: string; url: string }[]
}

interface HeuristicResult {
  check: string
  result: 'PASS' | 'WARN' | 'FAIL'
  detail: string
}

function analyzeUrlHeuristics(url: string): HeuristicResult[] {
  const results: HeuristicResult[] = []
  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    return [{ check: 'URL PARSE', result: 'FAIL', detail: 'INVALID URL FORMAT' }]
  }

  // HTTPS check
  results.push({
    check: 'PROTOCOL',
    result: parsed.protocol === 'https:' ? 'PASS' : 'WARN',
    detail: parsed.protocol === 'https:' ? 'USING HTTPS' : 'NOT USING HTTPS — INSECURE',
  })

  // Domain length
  const domainLen = parsed.hostname.length
  results.push({
    check: 'DOMAIN LENGTH',
    result: domainLen > 30 ? 'WARN' : 'PASS',
    detail: `${String(domainLen)} CHARACTERS ${domainLen > 30 ? '— UNUSUALLY LONG' : '— NORMAL'}`,
  })

  // Subdomain count
  const subdomains = parsed.hostname.split('.').length - 2
  results.push({
    check: 'SUBDOMAINS',
    result: subdomains > 3 ? 'WARN' : 'PASS',
    detail: `${String(subdomains)} SUBDOMAINS ${subdomains > 3 ? '— EXCESSIVE' : '— NORMAL'}`,
  })

  // IP address as domain
  const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname)
  results.push({
    check: 'IP AS DOMAIN',
    result: isIP ? 'WARN' : 'PASS',
    detail: isIP ? 'USING RAW IP ADDRESS — SUSPICIOUS' : 'USING DOMAIN NAME — NORMAL',
  })

  // Suspicious keywords
  const suspicious = ['login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm', 'bank']
  const foundKeywords = suspicious.filter((k) => url.toLowerCase().includes(k))
  results.push({
    check: 'SUSPICIOUS KEYWORDS',
    result: foundKeywords.length > 2 ? 'WARN' : foundKeywords.length > 0 ? 'WARN' : 'PASS',
    detail: foundKeywords.length > 0 ? `FOUND: ${foundKeywords.join(', ')}` : 'NONE FOUND',
  })

  // URL encoding
  const hasEncoding = /%[0-9a-f]{2}/i.test(url)
  results.push({
    check: 'URL ENCODING',
    result: hasEncoding ? 'WARN' : 'PASS',
    detail: hasEncoding ? 'CONTAINS ENCODED CHARACTERS — MAY BE OBFUSCATION' : 'NO ENCODED CHARACTERS',
  })

  // @ symbol (redirect trick)
  results.push({
    check: '@ REDIRECT',
    result: url.includes('@') ? 'FAIL' : 'PASS',
    detail: url.includes('@') ? '⚠ CONTAINS @ — POSSIBLE REDIRECT ATTACK' : 'NO @ REDIRECT DETECTED',
  })

  // Port number
  results.push({
    check: 'NON-STANDARD PORT',
    result: parsed.port && parsed.port !== '443' && parsed.port !== '80' ? 'WARN' : 'PASS',
    detail: parsed.port ? `PORT ${parsed.port} — NON-STANDARD` : 'STANDARD PORT',
  })

  return results
}

export function PhishingAnalyzer() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<PhishingResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleExecute = useCallback(async (inputs: Record<string, string>) => {
    const url = inputs.url?.trim()
    if (!url) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setAiResult(null)

    try {
      const [urlhausResult, heuristics] = await Promise.all([
        checkURL(url),
        Promise.resolve(analyzeUrlHeuristics(url)),
      ])

      let urlhausData: PhishingResults['urlhaus'] = null
      let urlhausError: string | null = null

      if (urlhausResult.error) {
        urlhausError = urlhausResult.error
      } else if (urlhausResult.data) {
        const info = urlhausResult.data.url_info
        urlhausData = info
          ? {
              found: urlhausResult.data.query_status === 'ok',
              threat: info.threat || 'UNKNOWN',
              status: info.url_status || 'UNKNOWN',
              reference: info.urlhaus_reference || '',
              tags: info.tags ?? [],
            }
          : { found: false, threat: '', status: '', reference: '', tags: [] }
      }

      // Calculate risk score
      const failCount = heuristics.filter((h) => h.result === 'FAIL').length
      const warnCount = heuristics.filter((h) => h.result === 'WARN').length
      const urlhausRisk = urlhausData?.found ? 40 : 0
      const riskScore = Math.min(100, urlhausRisk + failCount * 25 + warnCount * 10)

      const linkOuts = [
        { name: 'VIRUSTOTAL', url: `https://www.virustotal.com/gui/url/${encodeURIComponent(url)}` },
        { name: 'GOOGLE SAFE BROWSING', url: `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(url)}` },
        { name: 'URLSCAN.IO', url: `https://urlscan.io/search/#${encodeURIComponent(url)}` },
        { name: 'WHOIS', url: `https://who.is/whois/${new URL(url).hostname}` },
      ]

      setResults({ url, urlhaus: urlhausData, urlhausError, heuristics, riskScore, linkOuts })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ANALYSIS FAILED')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resultsNode = results ? <PhishingResultsDisplay results={results} /> : null

  return (
    <ModuleCard
      spec={spec}
      onExecute={handleExecute}
      isLoading={isLoading}
      results={resultsNode}
      error={error}
      aiResult={aiResult}
    />
  )
}

function PhishingResultsDisplay({ results }: { results: PhishingResults }) {
  const riskColor =
    results.riskScore >= 70 ? 'var(--red-critical)' : results.riskScore >= 40 ? 'var(--amber)' : 'var(--phosphor)'
  const riskLabel = results.riskScore >= 70 ? 'HIGH RISK' : results.riskScore >= 40 ? 'MEDIUM RISK' : 'LOW RISK'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Risk score */}
      <div
        style={{
          padding: '10px',
          border: `1px solid ${riskColor}`,
          background: 'var(--bg-deep)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '20px', color: riskColor, fontFamily: 'var(--font-mono)' }}>
          {results.riskScore}/100
        </div>
        <div style={{ fontSize: '11px', color: riskColor, textTransform: 'uppercase' }}>
          {riskLabel}
        </div>
      </div>

      {/* URLhaus */}
      {results.urlhaus && (
        <div
          style={{
            padding: '8px 10px',
            background: 'var(--bg-deep)',
            border: `1px solid ${results.urlhaus.found ? 'var(--red-critical)' : 'var(--phosphor-faint)'}`,
            fontSize: '10px',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ color: 'var(--phosphor-dim)', marginBottom: '4px' }}>URLHAUS DATABASE</div>
          {results.urlhaus.found ? (
            <>
              <div style={{ color: 'var(--red-critical)' }}>
                ⚠ URL FOUND IN THREAT DATABASE
              </div>
              <div style={{ color: 'var(--phosphor-dim)', marginTop: '2px' }}>
                THREAT: {results.urlhaus.threat} // STATUS: {results.urlhaus.status}
                {results.urlhaus.tags.length > 0 && ` // TAGS: ${results.urlhaus.tags.join(', ')}`}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--phosphor)' }}>✓ NOT FOUND IN URLHAUS DATABASE</div>
          )}
        </div>
      )}
      {results.urlhausError && (
        <div style={{ fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase' }}>
          ⚠ URLHAUS: {results.urlhausError}
        </div>
      )}

      {/* Heuristic checks */}
      <div>
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
          HEURISTIC ANALYSIS
        </div>
        {results.heuristics.map((h, i) => {
          const color = h.result === 'FAIL' ? 'var(--red-critical)' : h.result === 'WARN' ? 'var(--amber)' : 'var(--phosphor)'
          const icon = h.result === 'FAIL' ? '✕' : h.result === 'WARN' ? '⚠' : '✓'
          return (
            <div
              key={`heur-${String(i)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 0',
                fontSize: '10px',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--phosphor-faint)',
              }}
            >
              <span style={{ color, width: '16px' }}>{icon}</span>
              <span style={{ color: 'var(--phosphor-dim)', width: '140px', flexShrink: 0 }}>{h.check}</span>
              <span style={{ color }}>{h.detail}</span>
            </div>
          )
        })}
      </div>

      {/* Link-outs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {results.linkOuts.map((link) => (
          <a
            key={link.name}
            href={link.url}
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
            ▶ {link.name} ↗
          </a>
        ))}
      </div>
    </div>
  )
}
