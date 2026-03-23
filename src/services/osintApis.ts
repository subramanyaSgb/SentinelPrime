/**
 * OSINT API Service — Real API calls for modules with free API access.
 *
 * Each function handles a specific free API that supports CORS or
 * returns publicly accessible data. Results are typed and error-handled.
 *
 * PRD Section 4: No thrown exceptions — all functions return { data, error }.
 */

interface ApiResult<T> {
  data: T | null
  error: string | null
}

const TIMEOUT = 10000

async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) {
      return { data: null, error: `HTTP_${String(response.status)}` }
    }
    const data = await response.json() as T
    return { data, error: null }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'API_TIMEOUT: 10S' }
    }
    const msg = err instanceof Error ? err.message : 'UNKNOWN ERROR'
    return { data: null, error: msg.toUpperCase() }
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchText(url: string): Promise<ApiResult<string>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      return { data: null, error: `HTTP_${String(response.status)}` }
    }
    const text = await response.text()
    return { data: text, error: null }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'API_TIMEOUT: 10S' }
    }
    const msg = err instanceof Error ? err.message : 'UNKNOWN ERROR'
    return { data: null, error: msg.toUpperCase() }
  } finally {
    clearTimeout(timeout)
  }
}

// ═══════════════════════════════════════════════════════════
//  IP GEOLOCATION — ip-api.com (free, CORS-enabled, no key)
// ═══════════════════════════════════════════════════════════
export interface IpGeoResult {
  status: string
  country: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  query: string
}

export async function ipGeoLookup(ip: string): Promise<ApiResult<IpGeoResult>> {
  return fetchJson<IpGeoResult>(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
  )
}

// ═══════════════════════════════════════════════════════════
//  CERTIFICATE TRANSPARENCY — crt.sh (free, CORS-enabled)
// ═══════════════════════════════════════════════════════════
export interface CrtShResult {
  issuer_ca_id: number
  issuer_name: string
  common_name: string
  name_value: string
  id: number
  entry_timestamp: string
  not_before: string
  not_after: string
  serial_number: string
}

export async function crtShLookup(domain: string): Promise<ApiResult<CrtShResult[]>> {
  return fetchJson<CrtShResult[]>(
    `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`
  )
}

// ═══════════════════════════════════════════════════════════
//  URLHAUS — abuse.ch (free, CORS-enabled)
// ═══════════════════════════════════════════════════════════
export interface UrlhausResult {
  query_status: string
  id?: string
  urlhaus_reference?: string
  url?: string
  url_status?: string
  host?: string
  date_added?: string
  threat?: string
  blacklists?: Record<string, string>
  tags?: string[]
}

export async function urlhausLookup(url: string): Promise<ApiResult<UrlhausResult>> {
  const formData = new URLSearchParams()
  formData.append('url', url)

  return fetchJson<UrlhausResult>('https://urlhaus-api.abuse.ch/v1/url/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })
}

export async function urlhausHostLookup(host: string): Promise<ApiResult<UrlhausResult>> {
  const formData = new URLSearchParams()
  formData.append('host', host)

  return fetchJson<UrlhausResult>('https://urlhaus-api.abuse.ch/v1/host/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })
}

// ═══════════════════════════════════════════════════════════
//  WAYBACK MACHINE — CDX API (free, CORS-enabled)
// ═══════════════════════════════════════════════════════════
export interface WaybackSnapshot {
  timestamp: string
  original: string
  mimetype: string
  statuscode: string
  digest: string
  length: string
}

export async function waybackLookup(url: string, limit = 50): Promise<ApiResult<WaybackSnapshot[]>> {
  const result = await fetchJson<string[][]>(
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=${String(limit)}`
  )

  if (!result.data || result.error) {
    return { data: null, error: result.error }
  }

  // First row is headers, rest are data
  const rows = result.data.slice(1)
  const snapshots: WaybackSnapshot[] = rows.map((row) => ({
    timestamp: row[1] ?? '',
    original: row[2] ?? '',
    mimetype: row[3] ?? '',
    statuscode: row[4] ?? '',
    digest: row[5] ?? '',
    length: row[6] ?? '',
  }))

  return { data: snapshots, error: null }
}

// ═══════════════════════════════════════════════════════════
//  GDELT — Global Event Database (free, CORS-enabled)
// ═══════════════════════════════════════════════════════════
export interface GdeltArticle {
  url: string
  title: string
  seendate: string
  socialimage: string
  domain: string
  language: string
  sourcecountry: string
}

export interface GdeltResult {
  articles?: GdeltArticle[]
}

export async function gdeltSearch(query: string, limit = 25): Promise<ApiResult<GdeltResult>> {
  return fetchJson<GdeltResult>(
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${String(limit)}&format=json`
  )
}

// ═══════════════════════════════════════════════════════════
//  REDDIT — Public profile (free, no auth for public data)
// ═══════════════════════════════════════════════════════════
export interface RedditUserAbout {
  kind: string
  data?: {
    name?: string
    created_utc?: number
    link_karma?: number
    comment_karma?: number
    is_gold?: boolean
    is_mod?: boolean
    subreddit?: {
      display_name?: string
      public_description?: string
      subscribers?: number
    }
  }
}

export async function redditUserLookup(username: string): Promise<ApiResult<RedditUserAbout>> {
  return fetchJson<RedditUserAbout>(
    `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`
  )
}

// ═══════════════════════════════════════════════════════════
//  GRAVATAR — Profile lookup by email hash (free, CORS)
// ═══════════════════════════════════════════════════════════
export interface GravatarProfile {
  entry?: Array<{
    hash?: string
    requestHash?: string
    profileUrl?: string
    preferredUsername?: string
    thumbnailUrl?: string
    displayName?: string
    aboutMe?: string
    currentLocation?: string
    urls?: Array<{ value: string; title: string }>
  }>
}

export async function gravatarLookup(email: string): Promise<ApiResult<GravatarProfile>> {
  // MD5 hash of email — use SubtleCrypto
  const encoder = new TextEncoder()
  const data = encoder.encode(email.trim().toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return fetchJson<GravatarProfile>(
    `https://en.gravatar.com/${hash}.json`
  )
}

// ═══════════════════════════════════════════════════════════
//  DNS LOOKUP — dns.google (free, CORS-enabled)
// ═══════════════════════════════════════════════════════════
export interface DnsResult {
  Status: number
  Answer?: Array<{
    name: string
    type: number
    TTL: number
    data: string
  }>
}

export async function dnsLookup(domain: string, type = 'A'): Promise<ApiResult<DnsResult>> {
  return fetchJson<DnsResult>(
    `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`
  )
}

// ═══════════════════════════════════════════════════════════
//  WHATSMY NAME — Username enumeration (free, CORS)
// ═══════════════════════════════════════════════════════════
export interface WmnSite {
  name: string
  uri_check: string
  uri_pretty?: string
  cat: string
  e_code: number
  e_string: string
  m_code: number
  m_string: string
}

export interface WmnData {
  sites: WmnSite[]
}

let wmnCache: WmnData | null = null

export async function loadWhatsMyNameData(): Promise<ApiResult<WmnData>> {
  if (wmnCache) return { data: wmnCache, error: null }

  const result = await fetchJson<WmnData>(
    'https://raw.githubusercontent.com/WebBreacher/WhatsMyName/main/wmn-data.json'
  )

  if (result.data) {
    wmnCache = result.data
  }
  return result
}

/**
 * Master dispatch — call the right API based on source name.
 * Returns structured data or null.
 */
export async function executeApiSource(
  sourceName: string,
  primaryInput: string
): Promise<ApiResult<Record<string, unknown>>> {
  const input = primaryInput.trim()
  if (!input) return { data: null, error: 'EMPTY_INPUT' }

  switch (sourceName) {
    case 'ip-api.com': {
      const result = await ipGeoLookup(input)
      return { data: result.data as unknown as Record<string, unknown>, error: result.error }
    }
    case 'crt.sh': {
      const result = await crtShLookup(input)
      return {
        data: result.data ? { certificates: result.data.slice(0, 50) } : null,
        error: result.error,
      }
    }
    case 'URLhaus': {
      const result = await urlhausLookup(input)
      return { data: result.data as unknown as Record<string, unknown>, error: result.error }
    }
    case 'Archive.org CDX API': {
      const result = await waybackLookup(input)
      return {
        data: result.data ? { snapshots: result.data } : null,
        error: result.error,
      }
    }
    case 'GDELT': {
      const result = await gdeltSearch(input)
      return { data: result.data as unknown as Record<string, unknown>, error: result.error }
    }
    case 'Reddit API': {
      const result = await redditUserLookup(input)
      return { data: result.data as unknown as Record<string, unknown>, error: result.error }
    }
    case 'Gravatar': {
      const result = await gravatarLookup(input)
      return { data: result.data as unknown as Record<string, unknown>, error: result.error }
    }
    case 'DNS lookup': {
      const result = await dnsLookup(input)
      return { data: result.data as unknown as Record<string, unknown>, error: result.error }
    }
    default:
      return { data: null, error: null } // No API implementation for this source
  }
}
