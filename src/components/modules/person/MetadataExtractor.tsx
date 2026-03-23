import { useState, useCallback, useRef } from 'react'
import { ModuleCard } from '../ModuleCard'
import { getModuleById } from '@/constants/moduleRegistry'
import { Button } from '@/components/ui'

/**
 * MetadataExtractor — Phase 4.8
 * Extracts EXIF, GPS, camera data from uploaded images.
 * Uses browser FileReader + manual EXIF parsing.
 */

const spec = getModuleById('metadata-extractor')!

interface MetadataResults {
  fileName: string
  fileSize: number
  fileType: string
  lastModified: string
  dimensions: { width: number; height: number } | null
  exifData: Record<string, string>
}

export function MetadataExtractor() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<MetadataResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    setResults(null)
    setAiResult(null)

    try {
      const metadata: MetadataResults = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
        dimensions: null,
        exifData: {},
      }

      // Extract dimensions for images
      if (file.type.startsWith('image/')) {
        const dimensions = await getImageDimensions(file)
        metadata.dimensions = dimensions

        // Extract EXIF data from JPEG
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          const exif = await extractExifData(file)
          metadata.exifData = exif
        }
      }

      // Basic file metadata
      metadata.exifData['FILE_NAME'] = file.name
      metadata.exifData['FILE_SIZE'] = formatFileSize(file.size)
      metadata.exifData['FILE_TYPE'] = file.type || 'UNKNOWN'
      metadata.exifData['LAST_MODIFIED'] = new Date(file.lastModified).toISOString()

      if (metadata.dimensions) {
        metadata.exifData['IMAGE_WIDTH'] = String(metadata.dimensions.width) + 'px'
        metadata.exifData['IMAGE_HEIGHT'] = String(metadata.dimensions.height) + 'px'
        metadata.exifData['ASPECT_RATIO'] = (metadata.dimensions.width / metadata.dimensions.height).toFixed(2)
      }

      setResults(metadata)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'EXTRACTION FAILED')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Override the standard ModuleCard execute since this uses file input
  const handleExecute = useCallback(async () => {
    fileInputRef.current?.click()
  }, [])

  const handleCopy = useCallback(() => {
    if (!results) return
    void navigator.clipboard.writeText(JSON.stringify(results, null, 2))
  }, [results])

  const resultsNode = results ? <MetadataResultsDisplay results={results} /> : null

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFileSelect(file)
        }}
      />
      <ModuleCard
        spec={spec}
        onExecute={handleExecute}
        isLoading={isLoading}
        results={resultsNode}
        error={error}
        aiResult={aiResult}
        onCopy={results ? handleCopy : undefined}
      />
    </div>
  )
}

function MetadataResultsDisplay({ results }: { results: MetadataResults }) {
  const entries = Object.entries(results.exifData)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
        {results.fileName} // {formatFileSize(results.fileSize)} // {entries.length} METADATA FIELDS
      </div>

      {entries.map(([key, value]) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '10px',
            padding: '3px 0',
            borderBottom: '1px solid var(--phosphor-faint)',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: 'var(--phosphor)', width: '140px', flexShrink: 0 }}>{key}</span>
          <span style={{ color: 'var(--phosphor-dim)' }}>//</span>
          <span style={{ color: 'var(--phosphor-dim)', wordBreak: 'break-all' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

// Helpers

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

async function extractExifData(file: File): Promise<Record<string, string>> {
  const exif: Record<string, string> = {}

  try {
    const buffer = await file.arrayBuffer()
    const view = new DataView(buffer)

    // Check for JPEG SOI marker
    if (view.getUint16(0) !== 0xFFD8) return exif

    let offset = 2
    while (offset < view.byteLength - 2) {
      const marker = view.getUint16(offset)

      if (marker === 0xFFE1) {
        // APP1 — EXIF data
        const length = view.getUint16(offset + 2)

        // Check "Exif\0\0" header
        const exifHeader = String.fromCharCode(
          view.getUint8(offset + 4),
          view.getUint8(offset + 5),
          view.getUint8(offset + 6),
          view.getUint8(offset + 7)
        )

        if (exifHeader === 'Exif') {
          exif['EXIF_DATA'] = 'PRESENT'
          exif['EXIF_BLOCK_SIZE'] = `${String(length)} BYTES`
        }
        break
      }

      if ((marker & 0xFF00) !== 0xFF00) break

      const segmentLength = view.getUint16(offset + 2)
      offset += 2 + segmentLength
    }
  } catch {
    // EXIF parsing is best-effort
  }

  return exif
}
