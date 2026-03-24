/**
 * Proxy Fetch — Routes AI API calls through server-side proxy to avoid CORS.
 *
 * In production (Vercel), requests go through /api/ai-proxy edge function.
 * In development, tries direct fetch first, falls back to Vite dev proxy.
 *
 * This solves the CORS issue: browser → same-origin proxy → AI provider API.
 */

const PROXY_ENDPOINT = '/api/ai-proxy'

/**
 * Determines if we should use the proxy.
 * Always use proxy for known CORS-blocked domains.
 */
function shouldProxy(url: string): boolean {
  const corsBlockedDomains = [
    'integrate.api.nvidia.com',
    'api.groq.com',
    'openrouter.ai',
    'generativelanguage.googleapis.com',
  ]

  try {
    const hostname = new URL(url).hostname
    return corsBlockedDomains.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    )
  } catch {
    return false
  }
}

/**
 * Fetch via server-side proxy to bypass CORS restrictions.
 * Falls back to direct fetch if proxy is unavailable.
 */
export async function proxyFetch(
  url: string,
  init: RequestInit & { timeout?: number }
): Promise<Response> {
  const isStream = (() => {
    try {
      const body = JSON.parse(init.body as string) as { stream?: boolean }
      return body.stream === true
    } catch {
      return false
    }
  })()

  // Try proxy first for CORS-blocked domains
  if (shouldProxy(url)) {
    try {
      const upstreamMethod = (init.method ?? 'POST').toUpperCase()
      const proxyResponse = await fetchWithTimeout(
        PROXY_ENDPOINT,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: url,
            headers: extractHeaders(init.headers),
            body: init.body as string | undefined,
            stream: isStream,
            method: upstreamMethod,
          }),
        },
        init.timeout ?? 30000
      )

      // If proxy worked, return the response
      if (proxyResponse.ok || proxyResponse.status < 500) {
        return proxyResponse
      }
    } catch {
      // Proxy unavailable (e.g. local dev without proxy), fall through to direct
    }
  }

  // Direct fetch (works for non-CORS domains like Gemini, localhost)
  return fetchWithTimeout(url, init, init.timeout ?? 30000)
}

/**
 * Direct fetch with timeout support.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`REQUEST TIMEOUT: EXCEEDED ${String(Math.round(timeoutMs / 1000))}S`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Extract headers from HeadersInit into a plain object.
 */
function extractHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {}
  if (headers instanceof Headers) {
    const obj: Record<string, string> = {}
    headers.forEach((value, key) => {
      obj[key] = value
    })
    return obj
  }
  if (Array.isArray(headers)) {
    const obj: Record<string, string> = {}
    for (const [key, value] of headers) {
      obj[key] = value
    }
    return obj
  }
  return headers as Record<string, string>
}
