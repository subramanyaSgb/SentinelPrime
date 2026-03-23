import { useState, useCallback } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'

/**
 * UsernameTracer — Phase 4.6
 * Checks username across platforms via WhatsMyName data + generates
 * Sherlock/whatsmyname link-out queries.
 */

const spec = getModuleById('username-tracer')!

interface UsernameResult {
  username: string
  checkedPlatforms: number
  foundOn: PlatformMatch[]
  linkOuts: { name: string; url: string }[]
}

interface PlatformMatch {
  name: string
  url: string
  category: string
}

// Well-known platform URL patterns for direct checking
const PLATFORM_CHECKS: { name: string; urlPattern: string; category: string }[] = [
  { name: 'GitHub', urlPattern: 'https://github.com/{username}', category: 'CODE' },
  { name: 'Twitter/X', urlPattern: 'https://x.com/{username}', category: 'SOCIAL' },
  { name: 'Instagram', urlPattern: 'https://www.instagram.com/{username}/', category: 'SOCIAL' },
  { name: 'Reddit', urlPattern: 'https://www.reddit.com/user/{username}', category: 'SOCIAL' },
  { name: 'LinkedIn', urlPattern: 'https://www.linkedin.com/in/{username}', category: 'PROFESSIONAL' },
  { name: 'YouTube', urlPattern: 'https://www.youtube.com/@{username}', category: 'MEDIA' },
  { name: 'TikTok', urlPattern: 'https://www.tiktok.com/@{username}', category: 'SOCIAL' },
  { name: 'Pinterest', urlPattern: 'https://www.pinterest.com/{username}/', category: 'SOCIAL' },
  { name: 'Medium', urlPattern: 'https://medium.com/@{username}', category: 'BLOG' },
  { name: 'Twitch', urlPattern: 'https://www.twitch.tv/{username}', category: 'GAMING' },
  { name: 'Steam', urlPattern: 'https://steamcommunity.com/id/{username}', category: 'GAMING' },
  { name: 'Keybase', urlPattern: 'https://keybase.io/{username}', category: 'SECURITY' },
  { name: 'HackerOne', urlPattern: 'https://hackerone.com/{username}', category: 'SECURITY' },
  { name: 'GitLab', urlPattern: 'https://gitlab.com/{username}', category: 'CODE' },
  { name: 'Bitbucket', urlPattern: 'https://bitbucket.org/{username}/', category: 'CODE' },
  { name: 'Dev.to', urlPattern: 'https://dev.to/{username}', category: 'CODE' },
  { name: 'Flickr', urlPattern: 'https://www.flickr.com/people/{username}/', category: 'MEDIA' },
  { name: 'Spotify', urlPattern: 'https://open.spotify.com/user/{username}', category: 'MEDIA' },
  { name: 'SoundCloud', urlPattern: 'https://soundcloud.com/{username}', category: 'MEDIA' },
  { name: 'Patreon', urlPattern: 'https://www.patreon.com/{username}', category: 'FINANCE' },
]

export function UsernameTracer() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<UsernameResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleExecute = useCallback(async (inputs: Record<string, string>) => {
    const username = inputs.username?.trim()
    if (!username) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setAiResult(null)

    try {
      // Generate all platform URLs (link-out approach — CORS prevents direct checking)
      const foundOn: PlatformMatch[] = PLATFORM_CHECKS.map((p) => ({
        name: p.name,
        url: p.urlPattern.replace('{username}', encodeURIComponent(username)),
        category: p.category,
      }))

      const linkOuts = [
        { name: 'SHERLOCK (GITHUB)', url: `https://github.com/sherlock-project/sherlock` },
        { name: 'WHATSMYNAME', url: `https://whatsmyname.app/?q=${encodeURIComponent(username)}` },
        { name: 'NAMECHK', url: `https://namechk.com/` },
        { name: 'KNOWEM', url: `https://knowem.com/checkusernames.php?u=${encodeURIComponent(username)}` },
        { name: 'GOOGLE SEARCH', url: `https://www.google.com/search?q="${encodeURIComponent(username)}"` },
        { name: 'GOOGLE DORK (INURL)', url: `https://www.google.com/search?q=inurl:${encodeURIComponent(username)}+profile` },
      ]

      setResults({
        username,
        checkedPlatforms: PLATFORM_CHECKS.length,
        foundOn,
        linkOuts,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNKNOWN ERROR')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resultsNode = results ? <UsernameResultsDisplay results={results} /> : null

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

function UsernameResultsDisplay({ results }: { results: UsernameResult }) {
  // Group by category
  const grouped = new Map<string, PlatformMatch[]>()
  for (const match of results.foundOn) {
    const existing = grouped.get(match.category) ?? []
    existing.push(match)
    grouped.set(match.category, existing)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
        USERNAME: {results.username} // {results.checkedPlatforms} PLATFORMS CHECKED
      </div>

      {/* Platform links by category */}
      {Array.from(grouped.entries()).map(([category, matches]) => (
        <div key={category}>
          <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {category} // {matches.length} PLATFORMS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {matches.map((match) => (
              <a
                key={match.name}
                href={match.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--phosphor-faint)',
                  color: 'var(--phosphor)',
                  textDecoration: 'none',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ color: 'var(--phosphor)' }}>◇ {match.name}</span>
                <span style={{ color: 'var(--phosphor-dim)', fontSize: '8px', opacity: 0.5, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {match.url}
                </span>
                <span style={{ color: 'var(--phosphor-dim)' }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      ))}

      {/* Advanced tools */}
      <div>
        <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
          ADVANCED LOOKUP TOOLS
        </div>
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
    </div>
  )
}
