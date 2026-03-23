import { useState, useCallback } from 'react'
import { Button, Input, Separator } from '@/components/ui'
import { useAppStore } from '@/store/appStore'
import { useTargetStore } from '@/store/targetStore'
import { useSettingsStore } from '@/store/settingsStore'
import { getActiveProviderFromConfigs } from '@/providers'
import { saveToolResult } from '@/services/toolResultService'
import { executeApiSource } from '@/services/osintApis'
import type { ModuleSpec, ToolResult } from '@/types'

/**
 * GenericModuleExecutor — Universal execution component for ALL modules.
 * Renders dynamic inputs from ModuleSpec, executes via real APIs + AI + link-outs,
 * saves results to IndexedDB, and supports AI analysis.
 */

interface GenericModuleExecutorProps {
  spec: ModuleSpec
}

interface ExecutionResult {
  data: Record<string, unknown>
  linkOuts: { name: string; url: string }[]
  aiAnalysis: string | null
  apiResults: Record<string, unknown>[]
  apiErrors: string[]
}

export function GenericModuleExecutor({ spec }: GenericModuleExecutorProps) {
  const activeTargetId = useAppStore((s) => s.activeTargetId)
  const targets = useTargetStore((s) => s.targets)
  const providers = useSettingsStore((s) => s.providers)
  const target = activeTargetId ? targets.find((t) => t.id === activeTargetId) : null

  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [streamText, setStreamText] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  const updateInput = useCallback((name: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const allRequiredFilled = spec.inputs.every(
    (inp) => !inp.required || (inputValues[inp.name] ?? '').trim().length > 0
  )

  // Get the primary input value
  const getPrimaryInput = (): string => {
    const firstInputName = spec.inputs[0]?.name ?? ''
    return firstInputName ? (inputValues[firstInputName] ?? '') : ''
  }

  // Execute the module
  const handleExecute = useCallback(async () => {
    if (!allRequiredFilled || isExecuting) return

    setIsExecuting(true)
    setError(null)
    setResult(null)
    setIsSaved(false)
    setStreamText('')

    try {
      const linkOuts: { name: string; url: string }[] = []
      const data: Record<string, unknown> = {}
      const apiResults: Record<string, unknown>[] = []
      const apiErrors: string[] = []
      const primaryInput = getPrimaryInput()

      // Execute real API calls for free_api sources
      for (const ds of spec.dataSources) {
        if (ds.type === 'free_api') {
          const apiResult = await executeApiSource(ds.name, primaryInput)
          if (apiResult.data) {
            apiResults.push({ source: ds.name, ...apiResult.data })
            data[ds.name] = apiResult.data
          }
          if (apiResult.error) {
            apiErrors.push(`${ds.name}: ${apiResult.error}`)
          }
        }

        if (ds.type === 'link_out') {
          const urls = generateLinkOuts(ds.name, spec, inputValues)
          linkOuts.push(...urls)
        }
      }

      // Generate AI analysis if AI is enabled
      let aiAnalysis: string | null = null
      const hasAISource = spec.dataSources.some((ds) => ds.type === 'ai_only')

      if (hasAISource || spec.aiEnabled) {
        try {
          const provider = getActiveProviderFromConfigs(providers)
          if (provider.isConfigured()) {
            const inputSummary = spec.inputs
              .map((inp) => `${inp.label}: ${inputValues[inp.name] ?? 'N/A'}`)
              .join('\n')

            const apiDataSummary = apiResults.length > 0
              ? `\n\nAPI RESULTS:\n${JSON.stringify(apiResults, null, 2).slice(0, 3000)}`
              : ''

            const prompt = `Module: ${spec.name}\nCategory: ${spec.category}\nDescription: ${spec.description}\n\nInputs:\n${inputSummary}${apiDataSummary}\n\n${spec.aiPrompt ?? 'Analyze the data and provide structured intelligence assessment. Include confidence scores, key findings, risk indicators, and recommended next investigative steps.'}`

            const systemPrompt = `You are SentinelPrime's intelligence analyst AI. You are executing the ${spec.name} module in the ${spec.category} category. Provide structured, actionable intelligence output. Use UPPERCASE for section headers. Include confidence scores where applicable. Be thorough but concise.${target ? `\n\nCurrent target: ${target.name} (${target.type})` : ''}`

            let fullResponse = ''
            await provider.streamGenerate(prompt, systemPrompt, (text: string, isReasoning: boolean) => {
              if (!isReasoning) {
                fullResponse += text
                setStreamText(fullResponse)
              }
            })

            aiAnalysis = fullResponse
          }
        } catch (aiErr) {
          const aiErrMsg = aiErr instanceof Error ? aiErr.message : 'AI ANALYSIS FAILED'
          apiErrors.push(`AI: ${aiErrMsg}`)
        }
      }

      setResult({ data, linkOuts, aiAnalysis, apiResults, apiErrors })
      setStreamText('')
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Execution failed'
      setError(errMsg)
    } finally {
      setIsExecuting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequiredFilled, isExecuting, spec, inputValues, providers, target])

  // AI Analyze existing results
  const handleAIAnalyze = useCallback(async () => {
    if (!result || isAnalyzing) return

    setIsAnalyzing(true)
    setStreamText('')

    try {
      const provider = getActiveProviderFromConfigs(providers)
      if (!provider.isConfigured()) throw new Error('AI_OFFLINE')

      const inputSummary = spec.inputs
        .map((inp) => `${inp.label}: ${inputValues[inp.name] ?? 'N/A'}`)
        .join('\n')

      const apiDataStr = result.apiResults.length > 0
        ? `\nAPI Data:\n${JSON.stringify(result.apiResults, null, 2).slice(0, 3000)}`
        : ''

      const prompt = `Analyze these results more deeply:\n\nModule: ${spec.name}\nInputs:\n${inputSummary}\n${apiDataStr}\n\nLink-out resources: ${result.linkOuts.map((l) => l.name).join(', ')}\nPrevious analysis: ${result.aiAnalysis ?? 'None'}\n\nProvide deeper analysis, cross-reference findings, identify patterns, anomalies, and recommend specific next investigative steps.`

      let fullResponse = ''
      await provider.streamGenerate(prompt, 'You are SentinelPrime intelligence analyst. Provide deep, structured analysis with confidence scores.', (text: string, isReasoning: boolean) => {
        if (!isReasoning) {
          fullResponse += text
          setStreamText(fullResponse)
        }
      })

      setResult((prev) => prev ? { ...prev, aiAnalysis: fullResponse } : prev)
      setStreamText('')
    } catch {
      setError('AI analysis failed — check provider configuration in Settings')
    } finally {
      setIsAnalyzing(false)
    }
  }, [result, isAnalyzing, providers, spec, inputValues])

  // Save to target
  const handleSaveToTarget = useCallback(async () => {
    if (!activeTargetId || !result) return

    const toolResult: ToolResult = {
      id: crypto.randomUUID(),
      targetId: activeTargetId,
      toolId: spec.id,
      category: spec.category,
      input: inputValues,
      output: {
        linkOuts: result.linkOuts,
        data: result.data,
        apiResults: result.apiResults,
      },
      aiAnalysis: result.aiAnalysis ?? undefined,
      confidence: result.apiResults.length > 0 ? 75 : result.aiAnalysis ? 60 : 40,
      sources: [
        ...result.linkOuts.map((l) => l.name),
        ...result.apiResults.map((r) => String(r['source'] ?? 'API')),
      ],
      savedAt: new Date(),
      tags: spec.tags,
    }

    await saveToolResult(toolResult)
    setIsSaved(true)
  }, [activeTargetId, result, spec, inputValues])

  // Copy results to clipboard
  const handleCopy = useCallback(() => {
    if (!result) return
    const text = [
      `MODULE: ${spec.name.toUpperCase()}`,
      `CATEGORY: ${spec.category.toUpperCase()}`,
      '',
      ...spec.inputs.map((inp) => `${inp.label}: ${inputValues[inp.name] ?? 'N/A'}`),
      '',
      result.apiResults.length > 0 ? 'API RESULTS:' : '',
      result.apiResults.length > 0 ? JSON.stringify(result.apiResults, null, 2) : '',
      '',
      result.linkOuts.length > 0 ? 'LINK-OUT RESOURCES:' : '',
      ...result.linkOuts.map((l) => `- ${l.name}: ${l.url}`),
      '',
      result.aiAnalysis ? 'AI ANALYSIS:' : '',
      result.aiAnalysis ?? '',
    ].join('\n')
    void navigator.clipboard.writeText(text)
  }, [result, spec, inputValues])

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
          style={{ fontSize: '12px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
          className="text-glow"
        >
          {spec.name}
        </div>
        <div
          style={{
            fontSize: '8px',
            color: 'var(--phosphor-dim)',
            padding: '2px 6px',
            border: '1px solid var(--phosphor-faint)',
            textTransform: 'uppercase',
          }}
        >
          {spec.category} // CAT-{String(spec.categoryId)}
        </div>
      </div>
      <div
        style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '12px' }}
      >
        {spec.description}
      </div>

      <Separator />

      {/* Dynamic Inputs */}
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {spec.inputs.map((inp) => (
          <div key={inp.name}>
            <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
              {inp.label} {inp.required && '*'}
            </div>
            {inp.type === 'textarea' ? (
              <textarea
                value={inputValues[inp.name] ?? ''}
                onChange={(e) => updateInput(inp.name, e.target.value)}
                placeholder={inp.placeholder}
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--phosphor-faint)',
                  color: 'var(--phosphor)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  padding: '6px 8px',
                  resize: 'vertical',
                  textTransform: 'uppercase',
                }}
              />
            ) : inp.type === 'file' ? (
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) updateInput(inp.name, file.name)
                }}
                style={{
                  width: '100%',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--phosphor-faint)',
                  color: 'var(--phosphor)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  padding: '4px 8px',
                }}
              />
            ) : (
              <Input
                value={inputValues[inp.name] ?? ''}
                onChange={(e) => updateInput(inp.name, e.target.value)}
                placeholder={inp.placeholder}
                prefix=">_"
              />
            )}
          </div>
        ))}
      </div>

      {/* Data Sources Info */}
      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {spec.dataSources.map((ds) => (
          <span
            key={ds.name}
            style={{
              fontSize: '8px',
              color: ds.type === 'free_api' ? 'var(--phosphor)' : ds.type === 'ai_only' ? 'var(--amber)' : 'var(--phosphor-dim)',
              padding: '1px 4px',
              border: `1px solid ${ds.type === 'free_api' ? 'var(--phosphor-faint)' : 'transparent'}`,
              textTransform: 'uppercase',
            }}
          >
            {ds.type === 'free_api' ? '● ' : ds.type === 'ai_only' ? '◈ ' : '○ '}{ds.name}
          </span>
        ))}
      </div>

      {/* Execute Button */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <Button
          variant="primary"
          onClick={() => void handleExecute()}
          disabled={!allRequiredFilled || isExecuting}
          style={{ fontSize: '10px', flex: 1 }}
        >
          {isExecuting ? '● EXECUTING...' : '▶ EXECUTE'}
        </Button>
        {spec.rateLimit && (
          <div style={{ fontSize: '8px', color: 'var(--phosphor-dim)', alignSelf: 'center', textTransform: 'uppercase' }}>
            {spec.rateLimit}
          </div>
        )}
      </div>

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
      {(isExecuting || isAnalyzing) && streamText && (
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
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {streamText}
          <span className="cursor-blink" style={{ color: 'var(--phosphor)' }}>_</span>
        </div>
      )}

      {/* Results */}
      {result && !isExecuting && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* API Results */}
          {result.apiResults.length > 0 && (
            <div
              style={{
                padding: '8px 10px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--phosphor-faint)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase', marginBottom: '6px' }}>
                ● API RESULTS ({String(result.apiResults.length)} SOURCES)
              </div>
              <div style={{ fontSize: '9px', color: 'var(--phosphor)', lineHeight: 1.6 }}>
                {result.apiResults.map((apiRes, idx) => (
                  <div key={`api-${String(idx)}`} style={{ marginBottom: '8px' }}>
                    <div style={{ color: 'var(--phosphor-dim)', marginBottom: '2px', textTransform: 'uppercase' }}>
                      {String(apiRes['source'] ?? `SOURCE ${String(idx + 1)}`)}:
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '9px',
                        color: 'var(--phosphor)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        maxHeight: '150px',
                        overflowY: 'auto',
                      }}
                    >
                      {formatApiResult(apiRes)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Errors */}
          {result.apiErrors.length > 0 && (
            <div
              style={{
                padding: '6px 10px',
                background: 'rgba(255, 183, 0, 0.03)',
                border: '1px solid var(--amber)',
                fontSize: '9px',
                color: 'var(--amber)',
                textTransform: 'uppercase',
              }}
            >
              {result.apiErrors.map((err, idx) => (
                <div key={`err-${String(idx)}`}>⚠ {err}</div>
              ))}
            </div>
          )}

          {/* Link-out resources */}
          {result.linkOuts.length > 0 && (
            <div
              style={{
                padding: '8px 10px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--phosphor-faint)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                EXTERNAL RESOURCES ({String(result.linkOuts.length)})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.linkOuts.map((link, idx) => (
                  <a
                    key={`link-${String(idx)}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '9px',
                      color: 'var(--phosphor)',
                      textDecoration: 'none',
                      padding: '4px 6px',
                      border: '1px solid var(--phosphor-faint)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span style={{ color: 'var(--phosphor-dim)' }}>▶</span>
                    {link.name}
                    <span style={{ marginLeft: 'auto', fontSize: '8px', color: 'var(--phosphor-dim)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.url}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {result.aiAnalysis && (
            <div
              style={{
                padding: '8px 10px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--phosphor-faint)',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: '6px' }}>
                ◈ AI ANALYSIS
              </div>
              <div
                style={{
                  fontSize: '9px',
                  color: 'var(--phosphor)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {result.aiAnalysis}
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex gap-2">
            {spec.aiEnabled && (
              <Button
                variant="ghost"
                onClick={() => void handleAIAnalyze()}
                disabled={isAnalyzing}
                style={{ fontSize: '9px' }}
              >
                {isAnalyzing ? '● ...' : '◈ AI ANALYZE'}
              </Button>
            )}
            {activeTargetId && (
              <Button
                variant="ghost"
                onClick={() => void handleSaveToTarget()}
                disabled={isSaved}
                style={{ fontSize: '9px' }}
              >
                {isSaved ? '✓ SAVED' : '⎗ SAVE TO TARGET'}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleCopy}
              style={{ fontSize: '9px' }}
            >
              ⎘ COPY
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Format API result for display — show key-value pairs nicely.
 */
function formatApiResult(result: Record<string, unknown>): string {
  const entries = Object.entries(result).filter(([key]) => key !== 'source')
  if (entries.length === 0) return 'No data returned'

  return entries
    .map(([key, value]) => {
      if (value === null || value === undefined) return null
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return `${key}: [${String(value.length)} items]`
        }
        return `${key}: ${JSON.stringify(value, null, 2).slice(0, 200)}`
      }
      return `${key}: ${String(value)}`
    })
    .filter(Boolean)
    .join('\n')
}

/**
 * Generate link-out URLs based on data source name and module inputs.
 * Maps known service names to URL templates.
 */
function generateLinkOuts(
  sourceName: string,
  spec: ModuleSpec,
  inputs: Record<string, string>
): { name: string; url: string }[] {
  const firstInputName = spec.inputs[0]?.name ?? ''
  const primaryInput = firstInputName ? (inputs[firstInputName] ?? '') : ''
  const encoded = encodeURIComponent(primaryInput)

  const linkMap: Record<string, { name: string; url: string }[]> = {
    'Google Search': [{ name: 'Google Search', url: `https://www.google.com/search?q=${encoded}` }],
    'Google Images': [{ name: 'Google Reverse Image', url: `https://lens.google.com/uploadbyurl?url=${encoded}` }],
    'Yandex Images': [{ name: 'Yandex Reverse Image', url: `https://yandex.com/images/search?rpt=imageview&url=${encoded}` }],
    'TinEye': [{ name: 'TinEye Reverse Image', url: `https://tineye.com/search?url=${encoded}` }],
    'Social Blade': [{ name: 'Social Blade', url: `https://socialblade.com/search/search?query=${encoded}` }],
    'Multiple Platforms': [
      { name: 'X (Twitter)', url: `https://x.com/${primaryInput}` },
      { name: 'Instagram', url: `https://www.instagram.com/${primaryInput}` },
      { name: 'Facebook', url: `https://www.facebook.com/${primaryInput}` },
      { name: 'LinkedIn', url: `https://www.linkedin.com/in/${primaryInput}` },
      { name: 'GitHub', url: `https://github.com/${primaryInput}` },
    ],
    'PhoneInfoga': [{ name: 'PhoneInfoga', url: `https://demo.phoneinfoga.crvx.fr/` }],
    'Sherlock': [{ name: 'Sherlock CLI', url: `https://github.com/sherlock-project/sherlock` }],
    'IntelX': [{ name: 'Intelligence X', url: `https://intelx.io/?s=${encoded}` }],
    'Pastebin Search': [{ name: 'Pastebin', url: `https://www.google.com/search?q=site:pastebin.com+${encoded}` }],
    'GDELT': [{ name: 'GDELT', url: `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}&mode=artlist&format=html` }],
    'Google News': [{ name: 'Google News', url: `https://news.google.com/search?q=${encoded}` }],
    'Telegram Search': [{ name: 'Telegram Search', url: `https://www.google.com/search?q=site:t.me+${encoded}` }],
    'Wappalyzer': [{ name: 'Wappalyzer', url: `https://www.wappalyzer.com/lookup/${encoded}` }],
    'BuiltWith': [{ name: 'BuiltWith', url: `https://builtwith.com/${primaryInput}` }],
    'IMEI.info': [{ name: 'IMEI.info', url: `https://www.imei.info/` }],
    'Shodan': [{ name: 'Shodan Search', url: `https://www.shodan.io/search?query=${encoded}` }],
    'Default Passwords DB': [{ name: 'Default Passwords', url: `https://www.google.com/search?q=default+password+${encoded}` }],
    'Shipping Line APIs': [{ name: 'Track-Trace', url: `https://www.track-trace.com/container?number=${encoded}` }],
    'MarineTraffic': [{ name: 'MarineTraffic', url: `https://www.marinetraffic.com/en/ais/index/search/all/keyword:${encoded}` }],
    'VesselFinder': [{ name: 'VesselFinder', url: `https://www.vesselfinder.com/vessels?name=${encoded}` }],
    'OpenCelliD': [{ name: 'OpenCelliD', url: `https://opencellid.org/` }],
    'Sentinel Hub': [{ name: 'Sentinel Hub', url: `https://apps.sentinel-hub.com/eo-browser/` }],
    'Google Earth': [{ name: 'Google Earth', url: `https://earth.google.com/web/search/${encoded}` }],
    'Blockchain.com': [{ name: 'Blockchain.com', url: `https://www.blockchain.com/explorer/search?search=${encoded}` }],
    'Etherscan': [{ name: 'Etherscan', url: `https://etherscan.io/search?f=0&q=${encoded}` }],
    'OpenCorporates': [{ name: 'OpenCorporates', url: `https://opencorporates.com/companies?q=${encoded}` }],
    'SEC EDGAR': [{ name: 'SEC EDGAR', url: `https://www.sec.gov/cgi-bin/browse-edgar?company=${encoded}&CIK=&type=&dateb=&owner=include&count=40&search_text=&action=getcompany` }],
    'OFAC SDN': [{ name: 'OFAC SDN List', url: `https://sanctionssearch.ofac.treas.gov/` }],
    'UN Sanctions': [{ name: 'UN Sanctions', url: `https://www.un.org/securitycouncil/sanctions/information` }],
    'Ahmia': [{ name: 'Ahmia (.onion search)', url: `https://ahmia.fi/search/?q=${encoded}` }],
    'VirusTotal': [{ name: 'VirusTotal', url: `https://www.virustotal.com/gui/search/${encoded}` }],
    'BreachForums Search': [{ name: 'Google (forums)', url: `https://www.google.com/search?q=${encoded}+site:breachforums.st+OR+site:raidforums.com` }],
    'PACER': [{ name: 'PACER', url: `https://www.pacer.gov/` }],
    'CourtListener': [{ name: 'CourtListener', url: `https://www.courtlistener.com/?q=${encoded}` }],
    'Zillow': [{ name: 'Zillow', url: `https://www.zillow.com/homes/${encoded}_rb/` }],
    'County Records': [{ name: 'Google County Records', url: `https://www.google.com/search?q=${encoded}+property+records+county` }],
    'GrayhatWarfare': [{ name: 'GrayhatWarfare', url: `https://buckets.grayhatwarfare.com/files?keywords=${encoded}` }],
    'MITRE ATT&CK': [{ name: 'MITRE ATT&CK', url: `https://attack.mitre.org/search/?query=${encoded}` }],
    'State Medical Board': [{ name: 'Medical Board Search', url: `https://www.google.com/search?q=${encoded}+medical+license+verification` }],
    'FCC Database': [{ name: 'FCC License Search', url: `https://wireless2.fcc.gov/UlsApp/UlsSearch/searchLicense.jsp` }],
    'OOKLA': [{ name: 'Speedtest Coverage', url: `https://www.speedtest.net/ookla-5g-map` }],
    'Reddit API': [{ name: 'Reddit Profile', url: `https://www.reddit.com/user/${primaryInput}` }],
    'Google Safe Browsing': [{ name: 'Google Transparency Report', url: `https://transparencyreport.google.com/safe-browsing/search?url=${encoded}` }],
    'Censys': [{ name: 'Censys Search', url: `https://search.censys.io/search?resource=hosts&q=${encoded}` }],
    'BGP Toolkit': [{ name: 'Hurricane Electric BGP', url: `https://bgp.he.net/search?search%5Bsearch%5D=${encoded}&commit=Search` }],
    'AbuseIPDB': [{ name: 'AbuseIPDB', url: `https://www.abuseipdb.com/check/${primaryInput}` }],
    'Wigle.net': [{ name: 'WiGLE', url: `https://wigle.net/search` }],
    'FlightAware': [{ name: 'FlightAware', url: `https://flightaware.com/live/flight/${primaryInput}` }],
    'ADS-B Exchange': [{ name: 'ADS-B Exchange', url: `https://globe.adsbexchange.com/?icao=${primaryInput}` }],
    'WHOIS': [{ name: 'WHOIS Lookup', url: `https://www.whois.com/whois/${primaryInput}` }],
    'DNSdumpster': [{ name: 'DNSdumpster', url: `https://dnsdumpster.com/` }],
    'SecurityTrails': [{ name: 'SecurityTrails', url: `https://securitytrails.com/domain/${primaryInput}/dns` }],
  }

  // Default: generate Google search for the source
  const defaultLinks = [
    { name: `${sourceName} (Search)`, url: `https://www.google.com/search?q=${encoded}+${encodeURIComponent(sourceName)}` },
  ]

  return linkMap[sourceName] ?? defaultLinks
}
