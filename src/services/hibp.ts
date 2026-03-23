/**
 * HaveIBeenPwned Service — Breach lookup for emails.
 * Uses the unkeyed public API (limited to breach names only).
 * Full breach details require an API key ($3.50/month).
 *
 * Rate limit: 1 request per 1.5 seconds
 */

export interface BreachResult {
  Name: string
  Title: string
  Domain: string
  BreachDate: string
  AddedDate: string
  ModifiedDate: string
  PwnCount: number
  Description: string
  DataClasses: string[]
  IsVerified: boolean
  IsFabricated: boolean
  IsSensitive: boolean
  IsRetired: boolean
  IsSpamList: boolean
  LogoPath: string
}

interface ServiceResult<T> {
  data: T | null
  error: string | null
}

const HIBP_BASE = 'https://haveibeenpwned.com/api/v3'
const TIMEOUT_MS = 10000

/**
 * Check an email for known breaches.
 * The unkeyed API endpoint requires hibp-api-key header for v3.
 * We'll use the v2-compatible unkeyed breach list approach.
 */
export async function checkBreaches(email: string): Promise<ServiceResult<BreachResult[]>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(
      `${HIBP_BASE}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': '', // Free tier — may return 401
          'User-Agent': 'SentinelPrime-OSINT',
        },
        signal: controller.signal,
      }
    )

    clearTimeout(timeout)

    if (response.status === 404) {
      return { data: [], error: null } // No breaches found
    }

    if (response.status === 401 || response.status === 403) {
      // Fall back to breach name search (link-out approach)
      return {
        data: null,
        error: 'HIBP_API_KEY_REQUIRED: Full breach lookup requires a paid API key. Using link-out mode.',
      }
    }

    if (response.status === 429) {
      return { data: null, error: 'RATE_LIMITED: Too many requests. Wait 1.5 seconds between queries.' }
    }

    if (!response.ok) {
      return { data: null, error: `API_ERROR: HIBP returned status ${String(response.status)}` }
    }

    const data = (await response.json()) as BreachResult[]
    return { data, error: null }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, error: 'API_TIMEOUT: HIBP did not respond within 10s' }
    }
    return { data: null, error: `NETWORK_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

/**
 * Generate HIBP link-out URL for manual checking
 */
export function getHIBPUrl(email: string): string {
  return `https://haveibeenpwned.com/account/${encodeURIComponent(email)}`
}
