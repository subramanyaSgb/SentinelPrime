/**
 * Archive.org CDX API Service — Wayback Machine snapshot search.
 * Free, generous rate limits.
 */

export interface WaybackSnapshot {
  timestamp: string
  original: string
  mimetype: string
  statuscode: string
  digest: string
  length: string
}

interface ServiceResult<T> {
  data: T | null
  error: string | null
}

const TIMEOUT_MS = 15000

export async function searchSnapshots(
  url: string,
  limit: number = 50
): Promise<ServiceResult<WaybackSnapshot[]>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const params = new URLSearchParams({
      url,
      output: 'json',
      fl: 'timestamp,original,mimetype,statuscode,digest,length',
      limit: String(limit),
      collapse: 'timestamp:8', // One per day
    })

    const response = await fetch(
      `https://web.archive.org/cdx/search/cdx?${params.toString()}`,
      { signal: controller.signal }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      return { data: null, error: `API_ERROR: Archive.org returned status ${String(response.status)}` }
    }

    const raw = (await response.json()) as string[][]

    if (!raw || raw.length <= 1) {
      return { data: [], error: null }
    }

    // First row is headers, rest are data
    const snapshots: WaybackSnapshot[] = raw.slice(1).map((row) => ({
      timestamp: row[0] ?? '',
      original: row[1] ?? '',
      mimetype: row[2] ?? '',
      statuscode: row[3] ?? '',
      digest: row[4] ?? '',
      length: row[5] ?? '',
    }))

    return { data: snapshots, error: null }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, error: 'API_TIMEOUT: Archive.org did not respond within 15s' }
    }
    return { data: null, error: `NETWORK_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

/**
 * Generate Wayback Machine URL for a specific snapshot
 */
export function getSnapshotUrl(timestamp: string, originalUrl: string): string {
  return `https://web.archive.org/web/${timestamp}/${originalUrl}`
}
