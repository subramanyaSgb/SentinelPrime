import { useState, useCallback, useRef, useEffect } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Button, Input } from '@/components/ui'
import { getActiveProviderFromConfigs } from '@/providers'
import { useSettingsStore } from '@/store/settingsStore'

/**
 * AIChatInterface — Phase 5.1
 * AI chat interface per target. Uses active AI provider for conversation.
 * Persistent conversation within session, context includes target data.
 */

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isReasoning?: boolean
}

interface AIChatInterfaceProps {
  targetId?: string
}

export function AIChatInterface({ targetId }: AIChatInterfaceProps) {
  const targets = useTargetStore((s) => s.targets)
  const providers = useSettingsStore((s) => s.providers)
  const target = targetId ? targets.find((t) => t.id === targetId) : null

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  const buildSystemPrompt = useCallback(() => {
    let prompt = `You are SentinelPrime's intelligence analyst AI.
You analyze OSINT findings and provide structured intelligence assessments.
Always respond in a clear, professional manner with actionable insights.
Confidence scores range 0-100. Flag all unverified data.
Use UPPERCASE for section headers and key terms.`

    if (target) {
      prompt += `\n\nCURRENT TARGET:
NAME: ${target.name}
TYPE: ${target.type.toUpperCase()}
STATUS: ${target.status.toUpperCase()}
THREAT SCORE: ${String(target.threatScore)}/100
ALIASES: ${target.aliases.length > 0 ? target.aliases.join(', ') : 'None'}
IDENTIFIERS: ${target.identifiers.map((id) => `${id.type}: ${id.value}`).join(', ') || 'None'}
TAGS: ${target.tags.join(', ') || 'None'}
NOTES: ${target.notes || 'None'}
${target.aiSummary ? `PREVIOUS AI SUMMARY: ${target.aiSummary}` : ''}`
    }

    return prompt
  }, [target])

  const handleSend = useCallback(async () => {
    const userMsg = input.trim()
    if (!userMsg || isGenerating) return

    setInput('')
    setError(null)

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMsg,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsGenerating(true)
    setStreamText('')

    try {
      const provider = getActiveProviderFromConfigs(providers)

      if (!provider.isConfigured()) {
        throw new Error('AI_OFFLINE: No AI provider configured. Configure one in Settings.')
      }

      // Build conversation history for context
      const recentMessages = messages.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      // Combine into a single prompt
      const contextStr = recentMessages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n')

      const fullPrompt = contextStr
        ? `${contextStr}\n\nUSER: ${userMsg}`
        : userMsg

      let fullResponse = ''

      await provider.streamGenerate(
        fullPrompt,
        buildSystemPrompt(),
        (text: string, isReasoning: boolean) => {
          if (!isReasoning) {
            fullResponse += text
            setStreamText(fullResponse)
          }
        }
      )

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setStreamText('')
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'AI generation failed'
      setError(errMsg)

      // Add error as system message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: `ERROR: ${errMsg}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }, [input, isGenerating, messages, providers, buildSystemPrompt])

  const handleClearChat = useCallback(() => {
    setMessages([])
    setStreamText('')
    setError(null)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
      }}
      className="corner-brackets"
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--phosphor-faint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
            className="text-glow"
          >
            AI_ANALYST
            {target && ` // TARGET: ${target.name.toUpperCase()}`}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase' }}>
            {messages.filter((m) => m.role !== 'system').length} MESSAGES // CONTEXT:{' '}
            {target ? `${String(target.identifiers.length)} IDENTIFIERS` : 'NO TARGET'}
          </div>
        </div>
        <Button variant="ghost" onClick={handleClearChat} style={{ fontSize: '9px' }}>
          ✕ CLEAR
        </Button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.length === 0 && !streamText && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              fontSize: '10px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
              opacity: 0.5,
            }}
          >
            {target
              ? `ASK THE AI ANALYST ABOUT ${target.name.toUpperCase()}`
              : 'ASK THE AI ANALYST ANYTHING'}
            <br />
            <br />
            TRY: "SUMMARIZE FINDINGS" // "SUGGEST NEXT STEPS" // "ASSESS THREAT LEVEL"
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming indicator */}
        {streamText && (
          <div
            style={{
              padding: '8px 10px',
              background: 'var(--bg-deep)',
              border: '1px solid var(--phosphor-faint)',
              fontSize: '10px',
              color: 'var(--phosphor)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
              [ANALYST]
            </div>
            {streamText}
            <span className="cursor-blink" style={{ color: 'var(--phosphor)' }}>
              _
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '6px 12px',
            borderTop: '1px solid var(--red-critical)',
            fontSize: '9px',
            color: 'var(--red-critical)',
            textTransform: 'uppercase',
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--phosphor-faint)',
          display: 'flex',
          gap: '8px',
        }}
      >
        <div className="flex-1">
          <Input
            placeholder="ASK ANALYST ANYTHING..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
            prefix=">_"
            disabled={isGenerating}
          />
        </div>
        <Button
          variant="primary"
          onClick={() => void handleSend()}
          disabled={!input.trim() || isGenerating}
          style={{ fontSize: '10px', flexShrink: 0 }}
        >
          {isGenerating ? '● ...' : '▶ SEND'}
        </Button>
      </div>
    </div>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <div
      style={{
        padding: '8px 10px',
        background: isSystem
          ? 'rgba(255, 32, 32, 0.05)'
          : isUser
            ? 'rgba(0, 255, 65, 0.03)'
            : 'var(--bg-deep)',
        border: `1px solid ${isSystem ? 'var(--red-critical)' : 'var(--phosphor-faint)'}`,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '90%',
      }}
    >
      <div
        style={{
          fontSize: '9px',
          color: isSystem ? 'var(--red-critical)' : 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        {isUser ? '[OPERATOR]' : isSystem ? '[SYSTEM]' : '[ANALYST]'}
        {' // '}
        {message.timestamp.toLocaleTimeString('en-US', { hour12: false })}
      </div>
      <div
        style={{
          fontSize: '10px',
          color: isSystem ? 'var(--red-critical)' : 'var(--phosphor)',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}
      >
        {message.content}
      </div>
    </div>
  )
}
