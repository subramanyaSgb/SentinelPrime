import { useState, useCallback } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'

/**
 * GoogleDorkBuilder — Phase 4.4
 * AI-powered Google dork query generator.
 * Generates targeted search queries based on objective + optional domain.
 */

const spec = getModuleById('google-dork-builder')!

interface DorkResult {
  objective: string
  domain: string
  dorks: GeneratedDork[]
}

interface GeneratedDork {
  query: string
  description: string
  category: string
  googleUrl: string
}

function generateDorks(objective: string, domain: string): GeneratedDork[] {
  const domainFilter = domain ? `site:${domain} ` : ''
  const dorks: GeneratedDork[] = []

  // File type searches
  const fileTypes = [
    { ext: 'pdf', desc: 'PDF DOCUMENTS' },
    { ext: 'xlsx', desc: 'EXCEL SPREADSHEETS' },
    { ext: 'docx', desc: 'WORD DOCUMENTS' },
    { ext: 'pptx', desc: 'PRESENTATIONS' },
    { ext: 'csv', desc: 'CSV DATA FILES' },
    { ext: 'sql', desc: 'SQL DATABASE FILES' },
    { ext: 'env', desc: 'ENVIRONMENT FILES' },
    { ext: 'log', desc: 'LOG FILES' },
    { ext: 'conf', desc: 'CONFIGURATION FILES' },
    { ext: 'bak', desc: 'BACKUP FILES' },
  ]

  for (const ft of fileTypes.slice(0, 5)) {
    const query = `${domainFilter}filetype:${ft.ext} ${objective}`
    dorks.push({
      query,
      description: `SEARCH FOR ${ft.desc} RELATED TO OBJECTIVE`,
      category: 'FILE DISCOVERY',
      googleUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    })
  }

  // Directory listings
  dorks.push({
    query: `${domainFilter}intitle:"index of" ${objective}`,
    description: 'FIND OPEN DIRECTORY LISTINGS',
    category: 'DIRECTORY EXPOSURE',
    googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`${domainFilter}intitle:"index of" ${objective}`)}`,
  })

  // Credential / config exposure
  if (domain) {
    dorks.push({
      query: `site:${domain} intext:"password" filetype:txt`,
      description: 'SEARCH FOR EXPOSED PASSWORDS IN TEXT FILES',
      category: 'CREDENTIAL EXPOSURE',
      googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} intext:"password" filetype:txt`)}`,
    })

    dorks.push({
      query: `site:${domain} inurl:admin`,
      description: 'FIND ADMIN PANELS AND LOGIN PAGES',
      category: 'ADMIN PANELS',
      googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} inurl:admin`)}`,
    })

    dorks.push({
      query: `site:${domain} inurl:login | inurl:signin`,
      description: 'LOCATE LOGIN AND SIGN-IN PAGES',
      category: 'AUTH ENDPOINTS',
      googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} inurl:login | inurl:signin`)}`,
    })

    dorks.push({
      query: `site:${domain} ext:xml | ext:json | ext:yaml`,
      description: 'FIND EXPOSED DATA/CONFIG FILES',
      category: 'DATA EXPOSURE',
      googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} ext:xml | ext:json | ext:yaml`)}`,
    })
  }

  // Social / people search
  dorks.push({
    query: `"${objective}" site:linkedin.com | site:twitter.com | site:github.com`,
    description: 'SEARCH SOCIAL PLATFORMS FOR MENTIONS',
    category: 'SOCIAL DISCOVERY',
    googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`"${objective}" site:linkedin.com | site:twitter.com | site:github.com`)}`,
  })

  // Paste sites
  dorks.push({
    query: `"${objective}" site:pastebin.com | site:paste.ee | site:ghostbin.com`,
    description: 'SEARCH PASTE SITES FOR LEAKED DATA',
    category: 'PASTE DISCOVERY',
    googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`"${objective}" site:pastebin.com | site:paste.ee | site:ghostbin.com`)}`,
  })

  // Cached / archived
  dorks.push({
    query: `cache:${domain || objective}`,
    description: 'VIEW GOOGLE CACHED VERSION',
    category: 'CACHED CONTENT',
    googleUrl: `https://www.google.com/search?q=${encodeURIComponent(`cache:${domain || objective}`)}`,
  })

  return dorks
}

export function GoogleDorkBuilder() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<DorkResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleExecute = useCallback(async (inputs: Record<string, string>) => {
    const query = inputs.query?.trim()
    if (!query) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setAiResult(null)

    await new Promise((r) => setTimeout(r, 200))

    try {
      const domain = inputs.domain?.trim() ?? ''
      const dorks = generateDorks(query, domain)
      setResults({ objective: query, domain, dorks })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GENERATION FAILED')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCopy = useCallback(() => {
    if (!results) return
    const text = results.dorks.map((d) => `[${d.category}] ${d.query}\n  ${d.description}`).join('\n\n')
    void navigator.clipboard.writeText(text)
  }, [results])

  const resultsNode = results ? <DorkResultsDisplay results={results} /> : null

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

function DorkResultsDisplay({ results }: { results: DorkResult }) {
  // Group by category
  const grouped = new Map<string, GeneratedDork[]>()
  for (const dork of results.dorks) {
    const existing = grouped.get(dork.category) ?? []
    existing.push(dork)
    grouped.set(dork.category, existing)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
        GENERATED {results.dorks.length} DORKS // OBJECTIVE: {results.objective}
        {results.domain && ` // DOMAIN: ${results.domain}`}
      </div>

      {Array.from(grouped.entries()).map(([category, dorks]) => (
        <div key={category}>
          <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {category}
          </div>
          {dorks.map((dork, i) => (
            <div
              key={`dork-${String(i)}`}
              style={{
                padding: '6px 8px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--phosphor-faint)',
                marginBottom: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <code style={{ fontSize: '10px', color: 'var(--phosphor)', wordBreak: 'break-all' }}>
                  {dork.query}
                </code>
                <a
                  href={dork.googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '9px',
                    color: 'var(--phosphor)',
                    textDecoration: 'none',
                    padding: '2px 6px',
                    border: '1px solid var(--phosphor-faint)',
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}
                >
                  ▶ SEARCH ↗
                </a>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', marginTop: '2px', textTransform: 'uppercase' }}>
                {dork.description}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
