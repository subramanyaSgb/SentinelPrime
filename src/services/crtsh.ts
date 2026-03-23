/**
 * crt.sh Service — SSL Certificate Transparency log search.
 * Free, no API key, no rate limit.
 */

export interface CertResult {
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

interface ServiceResult<T> {
  data: T | null
  error: string | null
}

const TIMEOUT_MS = 15000 // crt.sh can be slow

export async function searchCertificates(domain: string): Promise<ServiceResult<CertResult[]>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(
      `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`,
      { signal: controller.signal }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      return { data: null, error: `API_ERROR: crt.sh returned status ${String(response.status)}` }
    }

    const data = (await response.json()) as CertResult[]
    return { data, error: null }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, error: 'API_TIMEOUT: crt.sh did not respond within 15s' }
    }
    return { data: null, error: `NETWORK_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}
