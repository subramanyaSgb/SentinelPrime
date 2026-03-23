import { useState, useCallback } from 'react'
import { Button, Input, Separator } from '@/components/ui'
import type { ModuleSpec } from '@/types'

/**
 * ModuleCard — Reusable module execution card.
 * Follows the PRD Section 6.8 Module Card pattern.
 *
 * Provides: input form, execute button, loading state, results display,
 * AI analyze button, save to target, copy, and link-out actions.
 */

interface ModuleCardProps {
  spec: ModuleSpec
  onExecute: (inputs: Record<string, string>) => Promise<void>
  isLoading: boolean
  results: React.ReactNode | null
  error: string | null
  onAIAnalyze?: () => void
  isAnalyzing?: boolean
  aiResult?: string | null
  onSaveToTarget?: () => void
  onCopy?: () => void
}

export function ModuleCard({
  spec,
  onExecute,
  isLoading,
  results,
  error,
  onAIAnalyze,
  isAnalyzing,
  aiResult,
  onSaveToTarget,
  onCopy,
}: ModuleCardProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({})

  const handleInputChange = useCallback((name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleExecute = useCallback(() => {
    void onExecute(inputs)
  }, [inputs, onExecute])

  const canExecute = spec.inputs
    .filter((i) => i.required)
    .every((i) => (inputs[i.name] ?? '').trim().length > 0)

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        maxWidth: '800px',
        width: '100%',
      }}
      className="corner-brackets"
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--phosphor-faint)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--phosphor)',
              textTransform: 'uppercase',
            }}
            className="text-glow"
          >
            ◈ {spec.name.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: '9px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            {spec.category.toUpperCase()} // CAT-{String(spec.categoryId).padStart(2, '0')}
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleExecute}
          disabled={!canExecute || isLoading}
          style={{ fontSize: '10px' }}
        >
          {isLoading ? '● EXECUTING...' : '▶ EXECUTE'}
        </Button>
      </div>

      {/* Description */}
      <div
        style={{
          padding: '8px 16px',
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          lineHeight: 1.5,
        }}
      >
        {spec.description.toUpperCase()}
      </div>

      <Separator />

      {/* Inputs */}
      <div style={{ padding: '12px 16px' }}>
        {spec.inputs.map((input) => (
          <div key={input.name} style={{ marginBottom: '8px' }}>
            <Input
              label={input.label}
              placeholder={input.placeholder}
              value={inputs[input.name] ?? ''}
              onChange={(e) => handleInputChange(input.name, e.target.value)}
              prefix=">_"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canExecute && !isLoading) handleExecute()
              }}
            />
          </div>
        ))}

        {/* Data sources */}
        <div style={{ marginTop: '4px' }}>
          <span
            style={{
              fontSize: '9px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
              opacity: 0.5,
            }}
          >
            SOURCES: {spec.dataSources.map((s) => s.name).join(' // ')}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            margin: '0 16px 12px',
            padding: '8px 12px',
            border: '1px solid var(--red-critical)',
            background: 'rgba(255, 32, 32, 0.05)',
            fontSize: '10px',
            color: 'var(--red-critical)',
            textTransform: 'uppercase',
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <>
          <Separator />
          <div style={{ padding: '12px 16px' }}>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--phosphor-dim)',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              RESULTS
            </div>
            {results}

            {/* Action buttons */}
            <div className="flex items-center gap-2" style={{ marginTop: '12px' }}>
              {spec.aiEnabled && onAIAnalyze && (
                <Button
                  variant="primary"
                  onClick={onAIAnalyze}
                  disabled={isAnalyzing}
                  style={{ fontSize: '10px' }}
                >
                  {isAnalyzing ? '● ANALYZING...' : '▶ AI ANALYZE'}
                </Button>
              )}
              {onSaveToTarget && (
                <Button variant="default" onClick={onSaveToTarget} style={{ fontSize: '10px' }}>
                  + ADD TO TARGET
                </Button>
              )}
              {onCopy && (
                <Button variant="ghost" onClick={onCopy} style={{ fontSize: '10px' }}>
                  ⎘ COPY
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* AI Analysis */}
      {aiResult && (
        <>
          <Separator />
          <div style={{ padding: '12px 16px' }}>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--phosphor-dim)',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              AI INTELLIGENCE ANALYSIS
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--phosphor)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {aiResult}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
