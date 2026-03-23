/**
 * ip-api.com Service — IP geolocation and ISP lookup.
 * Free tier: 45 requests/minute, HTTP only (no HTTPS on free).
 */

export interface IPGeoResult {
  status: string
  country: string
  countryCode: string
  region: string
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
  mobile: boolean
  proxy: boolean
  hosting: boolean
}

interface ServiceResult<T> {
  data: T | null
  error: string | null
}

const TIMEOUT_MS = 10000

export async function lookupIP(ip: string): Promise<ServiceResult<IPGeoResult>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,mobile,proxy,hosting`,
      { signal: controller.signal }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      return { data: null, error: `API_ERROR: ip-api returned status ${String(response.status)}` }
    }

    const data = (await response.json()) as IPGeoResult & { message?: string }

    if (data.status === 'fail') {
      return { data: null, error: `API_ERROR: ${data.message ?? 'Invalid IP address'}` }
    }

    return { data, error: null }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, error: 'API_TIMEOUT: ip-api did not respond within 10s' }
    }
    return { data: null, error: `NETWORK_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}
