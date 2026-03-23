import { useState, useCallback, useMemo } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { useSettingsStore } from '@/store/settingsStore'
import { getActiveProviderFromConfigs } from '@/providers'
import { Button, Separator } from '@/components/ui'
// Target type used implicitly via useTargetStore

/**
 * CrossModuleSynthesis — Phase 5.2
 * Combines findings across all modules for a target into a unified analysis.
 * Uses AI to correlate and synthesize intelligence from multiple data sources.
 */

interface SynthesisResult {
  summary: string
  keyFindings: string[]
  riskAssessment: string
  recommendations: string[]
  gaps: string[]
  confidence: number
  generatedAt: Date
}

interface CrossModuleSynthesisProps {
  targetId?: string
}

export function CrossModuleSynthesis({ targetId }: CrossModuleSynthesisProps) {
  const targets = useTargetStore((s) => s.targets)
  const updateTarget = useTargetStore((s) => s.updateTarget)
  const providers = useSettingsStore((s) => s.providers)
  const target = targetId ? targets.find((t) => t.id === targetId) : null

  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<SynthesisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [streamText, setStreamText] = useState('')

  // Build a comprehensive target data summary for the AI
  const targetDataSummary = useMemo(() => {
    if (!target) return ''

    const lines: string[] = [
      `TARGET: ${target.name.toUpperCase()}`,
      `TYPE: ${target.type.toUpperCase()}`,
      `STATUS: ${target.status.toUpperCase()}`,
      `THREAT SCORE: ${String(target.threatScore)}/100`,
      '',
      'ALIASES:',
      target.aliases.length > 0
        ? target.aliases.map((a) => `  - ${a}`).join('\n')
        : '  NONE',
      '',
      'IDENTIFIERS:',
      target.identifiers.length > 0
        ? target.identifiers.map((id) => `  - ${id.type.toUpperCase()}: ${id.value}`).join('\n')
        : '  NONE',
      '',
      'TAGS:',
      target.tags.length > 0
        ? target.tags.map((t) => `  - ${t}`).join('\n')
        : '  NONE',
      '',
      'NOTES:',
      target.notes || '  NONE',
    ]

    if (target.coordinates) {
      lines.push('', `COORDINATES: ${String(target.coordinates.lat)}, ${String(target.coordinates.lon)}`)
    }

    if (target.aiSummary) {
      lines.push('', 'PREVIOUS AI SUMMARY:', target.aiSummary)
    }

    return lines.join('\n')
  }, [target])

  // Count data points for display
  const dataPoints = useMemo(() => {
    if (!target) return { total: 0, identifiers: 0, aliases: 0, tags: 0 }
    return {
      total: target.identifiers.length + target.aliases.length + target.tags.length + (target.notes ? 1 : 0) + (target.coordinates ? 1 : 0),
      identifiers: target.identifiers.length,
      aliases: target.aliases.length,
      tags: target.tags.length,
    }
  }, [target])

  const handleSynthesize = useCallback(async () => {
    if (!target || isGenerating) return

    setIsGenerating(true)
    setError(null)
    setResult(null)
    setStreamText('')

    try {
      const provider = getActiveProviderFromConfigs(providers)

      if (!provider.isConfigured()) {
        throw new Error('AI_OFFLINE: No AI provider configured.')
      }

      const systemPrompt = `You are SentinelPrime's Cross-Module Synthesis Engine.
Your task is to analyze ALL available intelligence data for a target and produce a unified synthesis report.

Rules:
- Correlate data across all available identifiers and aliases
- Identify patterns, connections, and anomalies
- Assess overall risk level based on all available data
- Flag intelligence gaps that need further investigation
- Provide actionable recommendations
- Rate confidence 0-100 based on data quantity and quality
- Be specific and reference actual data points
- Use UPPERCASE for section headers

Respond in this EXACT format:

EXECUTIVE SUMMARY:
[2-3 sentence overview of all findings]

KEY FINDINGS:
1. [Finding with supporting evidence]
2. [Finding with supporting evidence]
3. [Finding with supporting evidence]
[Add more as needed]

RISK ASSESSMENT:
[Detailed risk assessment based on all data]

RECOMMENDATIONS:
1. [Specific actionable recommendation]
2. [Specific actionable recommendation]
3. [Specific actionable recommendation]

INTELLIGENCE GAPS:
1. [What data is missing that would improve analysis]
2. [What data is missing]

CONFIDENCE: [0-100]`

      const prompt = `Analyze the following target intelligence data and produce a cross-module synthesis report:

${targetDataSummary}

Produce a comprehensive intelligence synthesis.`

      let fullResponse = ''

      await provider.streamGenerate(
        prompt,
        systemPrompt,
        (text: string, isReasoning: boolean) => {
          if (!isReasoning) {
            fullResponse += text
            setStreamText(fullResponse)
          }
        }
      )

      // Parse the response into structured result
      const parsed = parseAISynthesis(fullResponse)
      setResult(parsed)
      setStreamText('')

      // Save synthesis as AI summary on target
      if (targetId) {
        updateTarget(targetId, { aiSummary: fullResponse })
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Synthesis failed'
      setError(errMsg)
    } finally {
      setIsGenerating(false)
    }
  }, [target, targetId, isGenerating, providers, targetDataSummary, updateTarget])

  const handleCopy = useCallback(() => {
    const text = result
      ? `CROSS-MODULE SYNTHESIS: ${target?.name?.toUpperCase() ?? 'UNKNOWN'}\n\n${streamText || formatResult(result)}`
      : streamText
    if (text) {
      void navigator.clipboard.writeText(text)
    }
  }, [result, streamText, target?.name])

  if (!target) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--phosphor-faint)',
          padding: '12px',
        }}
        className="corner-brackets"
      >
        <div
          style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
          className="text-glow"
        >
          CROSS-MODULE SYNTHESIS
        </div>
        <div style={{ textAlign: 'center', padding: '30px', fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', opacity: 0.5 }}>
          ○ SELECT A TARGET TO BEGIN SYNTHESIS
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        padding: '12px',
      }}
      className="corner-brackets"
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
        <div
          style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
          className="text-glow"
        >
          CROSS-MODULE SYNTHESIS
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => void handleSynthesize()}
            disabled={isGenerating}
            style={{ fontSize: '9px' }}
          >
            {isGenerating ? '● SYNTHESIZING...' : '▶ SYNTHESIZE'}
          </Button>
          {(result || streamText) && (
            <Button variant="ghost" onClick={handleCopy} style={{ fontSize: '9px' }}>
              ⎘ COPY
            </Button>
          )}
        </div>
      </div>
      <div
        style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '12px' }}
      >
        TARGET: {target.name.toUpperCase()} // {String(dataPoints.total)} DATA POINTS //
        {' '}{String(dataPoints.identifiers)} IDENTIFIERS // {String(dataPoints.aliases)} ALIASES
      </div>

      <Separator />

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px 10px',
            background: 'rgba(255, 32, 32, 0.05)',
            border: '1px solid var(--red-critical)',
            fontSize: '9px',
            color: 'var(--red-critical)',
            textTransform: 'uppercase',
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Streaming output */}
      {isGenerating && streamText && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px',
            background: 'var(--bg-deep)',
            border: '1px solid var(--phosphor-faint)',
            fontSize: '10px',
            color: 'var(--phosphor)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {streamText}
          <span className="cursor-blink" style={{ color: 'var(--phosphor)' }}>_</span>
        </div>
      )}

      {/* Synthesized result */}
      {result && !isGenerating && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Summary */}
          <SynthesisSection title="EXECUTIVE SUMMARY" content={result.summary} />

          {/* Key Findings */}
          <SynthesisSection title="KEY FINDINGS">
            {result.keyFindings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.keyFindings.map((finding, idx) => (
                  <div
                    key={`finding-${String(idx)}`}
                    style={{ fontSize: '9px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
                  >
                    {String(idx + 1)}. {finding}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', opacity: 0.5, textTransform: 'uppercase' }}>
                NO KEY FINDINGS IDENTIFIED
              </div>
            )}
          </SynthesisSection>

          {/* Risk Assessment */}
          <SynthesisSection title="RISK ASSESSMENT" content={result.riskAssessment} />

          {/* Recommendations */}
          <SynthesisSection title="RECOMMENDATIONS">
            {result.recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={`rec-${String(idx)}`}
                    style={{ fontSize: '9px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
                  >
                    ▶ {rec}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', opacity: 0.5, textTransform: 'uppercase' }}>
                NO RECOMMENDATIONS
              </div>
            )}
          </SynthesisSection>

          {/* Intelligence Gaps */}
          {result.gaps.length > 0 && (
            <SynthesisSection title="INTELLIGENCE GAPS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.gaps.map((gap, idx) => (
                  <div
                    key={`gap-${String(idx)}`}
                    style={{ fontSize: '9px', color: 'var(--amber)', textTransform: 'uppercase' }}
                  >
                    ⚠ {gap}
                  </div>
                ))}
              </div>
            </SynthesisSection>
          )}

          {/* Confidence */}
          <div
            style={{
              padding: '8px 10px',
              background: 'var(--bg-deep)',
              border: '1px solid var(--phosphor-faint)',
            }}
          >
            <div className="flex items-center justify-between">
              <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase' }}>
                SYNTHESIS CONFIDENCE
              </div>
              <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
                {'█'.repeat(Math.round(result.confidence / 10))}{'░'.repeat(10 - Math.round(result.confidence / 10))} {result.confidence}%
              </div>
            </div>
            <div style={{ fontSize: '8px', color: 'var(--phosphor-dim)', opacity: 0.5, textTransform: 'uppercase', marginTop: '2px' }}>
              GENERATED: {result.generatedAt.toISOString().replace('T', ' // ').slice(0, 22)} UTC
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !isGenerating && !error && (
        <div
          style={{
            textAlign: 'center',
            padding: '30px',
            fontSize: '10px',
            color: 'var(--phosphor-dim)',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          ○ CLICK SYNTHESIZE TO GENERATE CROSS-MODULE INTELLIGENCE REPORT
          <br />
          {dataPoints.total === 0
            ? 'ADD DATA TO TARGET FIRST FOR MEANINGFUL ANALYSIS'
            : `${String(dataPoints.total)} DATA POINTS AVAILABLE FOR ANALYSIS`}
        </div>
      )}
    </div>
  )
}

function SynthesisSection({
  title,
  content,
  children,
}: {
  title: string
  content?: string
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        padding: '8px 10px',
        background: 'var(--bg-deep)',
        border: '1px solid var(--phosphor-faint)',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        {title}
      </div>
      {content && (
        <div
          style={{
            fontSize: '9px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
            lineHeight: 1.6,
          }}
        >
          {content}
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * Parse AI response into structured SynthesisResult
 */
function parseAISynthesis(text: string): SynthesisResult {
  const sections: Record<string, string> = {}
  let currentSection = ''

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('EXECUTIVE SUMMARY:')) {
      currentSection = 'summary'
      const rest = trimmed.replace('EXECUTIVE SUMMARY:', '').trim()
      if (rest) sections[currentSection] = rest
    } else if (trimmed.startsWith('KEY FINDINGS:')) {
      currentSection = 'findings'
    } else if (trimmed.startsWith('RISK ASSESSMENT:')) {
      currentSection = 'risk'
      const rest = trimmed.replace('RISK ASSESSMENT:', '').trim()
      if (rest) sections[currentSection] = rest
    } else if (trimmed.startsWith('RECOMMENDATIONS:')) {
      currentSection = 'recommendations'
    } else if (trimmed.startsWith('INTELLIGENCE GAPS:')) {
      currentSection = 'gaps'
    } else if (trimmed.startsWith('CONFIDENCE:')) {
      sections['confidence'] = trimmed.replace('CONFIDENCE:', '').trim()
    } else if (currentSection && trimmed) {
      sections[currentSection] = sections[currentSection]
        ? sections[currentSection] + '\n' + trimmed
        : trimmed
    }
  }

  const parseNumberedList = (raw: string | undefined): string[] => {
    if (!raw) return []
    return raw
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').replace(/^[▶⚠◇●]\s*/, '').trim())
      .filter((line) => line.length > 0)
  }

  const confidenceMatch = sections['confidence']?.match(/\d+/)
  const confidence = confidenceMatch ? Math.min(100, parseInt(confidenceMatch[0], 10)) : 50

  return {
    summary: sections['summary'] || 'No summary generated.',
    keyFindings: parseNumberedList(sections['findings']),
    riskAssessment: sections['risk'] || 'No risk assessment available.',
    recommendations: parseNumberedList(sections['recommendations']),
    gaps: parseNumberedList(sections['gaps']),
    confidence,
    generatedAt: new Date(),
  }
}

function formatResult(result: SynthesisResult): string {
  const lines = [
    'EXECUTIVE SUMMARY:',
    result.summary,
    '',
    'KEY FINDINGS:',
    ...result.keyFindings.map((f, i) => `${String(i + 1)}. ${f}`),
    '',
    'RISK ASSESSMENT:',
    result.riskAssessment,
    '',
    'RECOMMENDATIONS:',
    ...result.recommendations.map((r, i) => `${String(i + 1)}. ${r}`),
    '',
    'INTELLIGENCE GAPS:',
    ...result.gaps.map((g, i) => `${String(i + 1)}. ${g}`),
    '',
    `CONFIDENCE: ${String(result.confidence)}%`,
    `GENERATED: ${result.generatedAt.toISOString()}`,
  ]
  return lines.join('\n')
}
