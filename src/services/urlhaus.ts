/**
 * URLhaus Service — Phishing/malware URL lookup via abuse.ch
 * Free, generous rate limits.
 */

export interface URLhausResult {
  query_status: string
  url_info: {
    id: string
    urlhaus_reference: string
    url: string
    url_status: string
    host: string
    date_added: string
    threat: string
    blacklists: {
      spamhaus_dbl: string
      surbl: string
    }
    reporter: string
    larted: string
    tags: string[] | null
    payloads: {
      filename: string | null
      file_type: string | null
      firstseen: string
      signature: string | null
      virustotal: {
        result: string
        percent: string
        link: string
      } | null
    }[] | null
  } | null
}

interface ServiceResult<T> {
  data: T | null
  error: string | null
}

const TIMEOUT_MS = 10000

export async function checkURL(url: string): Promise<ServiceResult<URLhausResult>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const formData = new URLSearchParams()
    formData.append('url', url)

    const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return { data: null, error: `API_ERROR: URLhaus returned status ${String(response.status)}` }
    }

    const data = (await response.json()) as URLhausResult
    return { data, error: null }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, error: 'API_TIMEOUT: URLhaus did not respond within 10s' }
    }
    return { data: null, error: `NETWORK_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}
