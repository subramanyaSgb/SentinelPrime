/**
 * Gravatar Service — Profile lookup by email hash.
 * Free, no rate limit, no API key required.
 */

export interface GravatarProfile {
  hash: string
  displayName: string
  profileUrl: string
  thumbnailUrl: string
  photos: { value: string; type: string }[]
  accounts: { domain: string; display: string; url: string; username: string; shortname: string }[]
  urls: { value: string; title: string }[]
}

interface ServiceResult<T> {
  data: T | null
  error: string | null
}

const TIMEOUT_MS = 10000

/**
 * Compute MD5 hash of email for Gravatar lookup.
 * Uses SubtleCrypto — returns hex string.
 */
async function md5Hash(input: string): Promise<string> {
  // Gravatar uses MD5, but SubtleCrypto doesn't support MD5
  // We'll use a simple implementation
  const encoder = new TextEncoder()
  const data = encoder.encode(input.trim().toLowerCase())
  // Fall back to a basic hash for avatar URL — Gravatar supports SHA256 now too
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function lookupGravatar(email: string): Promise<ServiceResult<GravatarProfile | null>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const hash = await md5Hash(email)

    const response = await fetch(
      `https://en.gravatar.com/${hash}.json`,
      { signal: controller.signal }
    )

    clearTimeout(timeout)

    if (response.status === 404) {
      return { data: null, error: null } // No Gravatar profile
    }

    if (!response.ok) {
      return { data: null, error: `API_ERROR: Gravatar returned status ${String(response.status)}` }
    }

    const json = (await response.json()) as { entry: GravatarProfile[] }
    const profile = json.entry?.[0] ?? null

    return { data: profile, error: null }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, error: 'API_TIMEOUT: Gravatar did not respond within 10s' }
    }
    return { data: null, error: `NETWORK_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

/**
 * Get avatar image URL
 */
export async function getAvatarUrl(email: string, size: number = 200): Promise<string> {
  const hash = await md5Hash(email)
  return `https://www.gravatar.com/avatar/${hash}?s=${String(size)}&d=identicon`
}
