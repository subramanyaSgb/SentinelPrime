import { useState, useCallback } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'

/**
 * PhoneIntel — Phase 4.5
 * Analyzes phone numbers — uses AI + link-out strategy.
 * Free API options are limited; generates intelligence from number patterns
 * and links out to PhoneInfoga and other tools.
 */

const spec = getModuleById('phone-intel')!

interface PhoneResults {
  input: string
  parsed: {
    countryCode: string
    nationalNumber: string
    type: string
    isValid: boolean
    isPossible: boolean
  }
  linkOuts: { name: string; url: string }[]
}

function parsePhoneNumber(input: string): PhoneResults['parsed'] {
  const cleaned = input.replace(/[^+\d]/g, '')
  const hasCountryCode = cleaned.startsWith('+')

  // Basic heuristics
  let countryCode = ''
  let nationalNumber = cleaned

  if (hasCountryCode) {
    if (cleaned.startsWith('+1') && cleaned.length === 12) {
      countryCode = '+1'
      nationalNumber = cleaned.slice(2)
    } else if (cleaned.startsWith('+44')) {
      countryCode = '+44'
      nationalNumber = cleaned.slice(3)
    } else if (cleaned.startsWith('+91')) {
      countryCode = '+91'
      nationalNumber = cleaned.slice(3)
    } else {
      // Generic: first 1-3 digits after + are country code
      countryCode = cleaned.slice(0, 4)
      nationalNumber = cleaned.slice(4)
    }
  }

  const isValid = cleaned.length >= 7 && cleaned.length <= 15
  const isPossible = cleaned.length >= 5

  // Rough type detection
  let type = 'UNKNOWN'
  if (countryCode === '+1') {
    type = nationalNumber.startsWith('800') || nationalNumber.startsWith('888') ? 'TOLL-FREE' : 'NANP (US/CA)'
  } else if (countryCode === '+44') {
    type = nationalNumber.startsWith('7') ? 'MOBILE (UK)' : 'LANDLINE (UK)'
  } else if (countryCode === '+91') {
    type = nationalNumber.startsWith('9') || nationalNumber.startsWith('8') || nationalNumber.startsWith('7') ? 'MOBILE (IN)' : 'LANDLINE (IN)'
  }

  return { countryCode, nationalNumber, type, isValid, isPossible }
}

export function PhoneIntel() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<PhoneResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleExecute = useCallback(async (inputs: Record<string, string>) => {
    const phone = inputs.phone?.trim()
    if (!phone) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setAiResult(null)

    // Simulate async processing
    await new Promise((r) => setTimeout(r, 300))

    try {
      const parsed = parsePhoneNumber(phone)
      const cleaned = phone.replace(/[^+\d]/g, '')

      const linkOuts = [
        { name: 'PHONEINFOGA', url: `https://demo.phoneinfoga.crvx.fr/scan?number=${encodeURIComponent(cleaned)}` },
        { name: 'TRUECALLER', url: `https://www.truecaller.com/search/us/${encodeURIComponent(cleaned)}` },
        { name: 'SYNC.ME', url: `https://sync.me/search/?number=${encodeURIComponent(cleaned)}` },
        { name: 'CALLER ID TEST', url: `https://www.calleridtest.com/` },
        { name: 'GOOGLE SEARCH', url: `https://www.google.com/search?q="${encodeURIComponent(phone)}"` },
        { name: 'NUMVERIFY', url: `https://numverify.com/` },
      ]

      setResults({ input: phone, parsed, linkOuts })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PARSE ERROR')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resultsNode = results ? <PhoneResultsDisplay results={results} /> : null

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

function PhoneResultsDisplay({ results }: { results: PhoneResults }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Parsed info */}
      <div
        style={{
          background: 'var(--bg-deep)',
          border: '1px solid var(--phosphor-faint)',
          padding: '8px 10px',
        }}
      >
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
          NUMBER ANALYSIS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px', textTransform: 'uppercase' }}>
          <div>
            <span style={{ color: 'var(--phosphor-dim)', width: '120px', display: 'inline-block' }}>INPUT</span>
            <span style={{ color: 'var(--phosphor-dim)' }}>// </span>
            <span style={{ color: 'var(--phosphor)' }}>{results.input}</span>
          </div>
          <div>
            <span style={{ color: 'var(--phosphor-dim)', width: '120px', display: 'inline-block' }}>COUNTRY CODE</span>
            <span style={{ color: 'var(--phosphor-dim)' }}>// </span>
            <span style={{ color: 'var(--phosphor)' }}>{results.parsed.countryCode || 'NOT DETECTED'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--phosphor-dim)', width: '120px', display: 'inline-block' }}>NATIONAL #</span>
            <span style={{ color: 'var(--phosphor-dim)' }}>// </span>
            <span style={{ color: 'var(--phosphor)' }}>{results.parsed.nationalNumber}</span>
          </div>
          <div>
            <span style={{ color: 'var(--phosphor-dim)', width: '120px', display: 'inline-block' }}>TYPE</span>
            <span style={{ color: 'var(--phosphor-dim)' }}>// </span>
            <span style={{ color: 'var(--phosphor)' }}>{results.parsed.type}</span>
          </div>
          <div>
            <span style={{ color: 'var(--phosphor-dim)', width: '120px', display: 'inline-block' }}>VALID FORMAT</span>
            <span style={{ color: 'var(--phosphor-dim)' }}>// </span>
            <span style={{ color: results.parsed.isValid ? 'var(--phosphor)' : 'var(--red-critical)' }}>
              {results.parsed.isValid ? '✓ YES' : '✕ NO'}
            </span>
          </div>
        </div>
      </div>

      {/* Link-outs */}
      <div>
        <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
          EXTERNAL LOOKUP TOOLS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {results.linkOuts.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--phosphor-faint)',
                color: 'var(--phosphor)',
                textDecoration: 'none',
                fontSize: '10px',
                textTransform: 'uppercase',
                transition: 'border-color 0.15s ease',
              }}
            >
              ▶ {link.name} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
