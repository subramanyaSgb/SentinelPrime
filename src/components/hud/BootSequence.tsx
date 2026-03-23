import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Boot Sequence — PRD Section 6.9
 *
 * 2.5 second terminal boot animation on first load.
 * Displays sequential system initialization with progress bars.
 * Skippable via any key press. Skips on subsequent loads.
 * Optional re-enable in Settings > Display > Boot Sequence.
 *
 * ```
 * SENTINEL//PRIME  INTELLIGENCE PLATFORM  v1.0.0
 * INITIALIZING CORE SYSTEMS...
 *
 * [████████████████████] LOADING MODULE REGISTRY........... 1462 MODULES OK
 * [████████████████████] INITIALIZING LOCAL DATABASE......... INDEXED_DB OK
 * [████████████████████] LOADING AI PROVIDER............. NEMOTRON/120B OK
 * [████████████████████] STARTING MONITORING DAEMONS......... 7 ACTIVE OK
 * [████████████████████] RENDERING MISSION CONTROL........... GLOBE OK
 *
 * ALL SYSTEMS NOMINAL. WELCOME, OPERATOR.
 * PRESS ANY KEY OR WAIT TO CONTINUE_
 * ```
 */

interface BootStep {
  label: string
  status: string
  duration: number // ms for this step's progress bar fill
}

const BOOT_STEPS: BootStep[] = [
  { label: 'LOADING MODULE REGISTRY', status: '1462 MODULES OK', duration: 400 },
  { label: 'INITIALIZING LOCAL DATABASE', status: 'INDEXED_DB OK', duration: 350 },
  { label: 'LOADING AI PROVIDER', status: 'NEMOTRON/120B OK', duration: 450 },
  { label: 'STARTING MONITORING DAEMONS', status: '7 ACTIVE OK', duration: 350 },
  { label: 'RENDERING MISSION CONTROL', status: 'GLOBE OK', duration: 400 },
]

const TOTAL_BOOT_TIME = 2500 // 2.5s per PRD
const TITLE_DELAY = 200 // Show title first
const SUBTITLE_DELAY = 500 // Then "INITIALIZING..." and start steps
const FINAL_MESSAGE_DELAY = 200 // After last step completes

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<'title' | 'subtitle' | 'steps' | 'complete'>('title')
  const [activeStep, setActiveStep] = useState(-1)
  const [stepProgress, setStepProgress] = useState<number[]>(BOOT_STEPS.map(() => 0))
  const [showPrompt, setShowPrompt] = useState(false)
  const completedRef = useRef(false)
  const animFrameRef = useRef<number>(0)

  const handleComplete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    cancelAnimationFrame(animFrameRef.current)
    onComplete()
  }, [onComplete])

  // Skip on any key press
  useEffect(() => {
    const handleKeyDown = () => handleComplete()
    const handleClick = () => handleComplete()

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClick)
    }
  }, [handleComplete])

  // Auto-complete after total boot time as fallback
  useEffect(() => {
    const timer = setTimeout(handleComplete, TOTAL_BOOT_TIME + 1000)
    return () => clearTimeout(timer)
  }, [handleComplete])

  // Phase progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Phase 1: Show title
    timers.push(setTimeout(() => setPhase('subtitle'), TITLE_DELAY))

    // Phase 2: Show subtitle
    timers.push(setTimeout(() => {
      setPhase('steps')
      setActiveStep(0)
    }, SUBTITLE_DELAY))

    return () => timers.forEach(clearTimeout)
  }, [])

  // Step progression with animated progress bars
  useEffect(() => {
    if (phase !== 'steps' || activeStep < 0 || activeStep >= BOOT_STEPS.length) return

    const step = BOOT_STEPS[activeStep]
    if (!step) return

    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / step.duration, 1)

      setStepProgress((prev) => {
        const next = [...prev]
        next[activeStep] = progress
        return next
      })

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Move to next step or complete
        if (activeStep < BOOT_STEPS.length - 1) {
          setActiveStep(activeStep + 1)
        } else {
          // All steps done
          setTimeout(() => {
            setPhase('complete')
            setShowPrompt(true)
            // Auto-proceed after showing the final message
            setTimeout(handleComplete, 800)
          }, FINAL_MESSAGE_DELAY)
        }
      }
    }

    // Small delay between steps for visual clarity
    const delay = setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(animate)
    }, activeStep === 0 ? 0 : 50)

    return () => {
      clearTimeout(delay)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [phase, activeStep, handleComplete])

  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{ background: 'var(--bg-void)', cursor: 'pointer' }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--phosphor)',
          maxWidth: '680px',
          width: '100%',
          padding: '0 24px',
        }}
      >
        {/* Title */}
        <div
          className="text-glow"
          style={{
            fontSize: '14px',
            letterSpacing: '2px',
            opacity: phase === 'title' ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          SENTINEL//PRIME {'  '}INTELLIGENCE PLATFORM {'  '}v0.1.0
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: 'var(--phosphor-dim)',
            marginTop: '4px',
            opacity: phase === 'title' ? 0 : 1,
            transition: 'opacity 0.3s ease 0.1s',
          }}
        >
          INITIALIZING CORE SYSTEMS...
        </div>

        {/* Boot steps */}
        <div style={{ marginTop: '20px' }}>
          {BOOT_STEPS.map((step, i) => (
            <BootStepLine
              key={i}
              label={step.label}
              status={step.status}
              progress={stepProgress[i] ?? 0}
              visible={phase === 'steps' || phase === 'complete' ? i <= activeStep : false}
              complete={(stepProgress[i] ?? 0) >= 1}
            />
          ))}
        </div>

        {/* Final message */}
        {phase === 'complete' && (
          <div style={{ marginTop: '20px' }}>
            <div
              className="text-glow"
              style={{
                color: 'var(--phosphor)',
                fontSize: '12px',
              }}
            >
              ALL SYSTEMS NOMINAL. WELCOME, OPERATOR.
            </div>
            {showPrompt && (
              <div
                style={{
                  color: 'var(--phosphor-dim)',
                  marginTop: '8px',
                  fontSize: '11px',
                  opacity: 0.6,
                }}
              >
                <span className="cursor-blink">PRESS ANY KEY OR CLICK TO CONTINUE</span>
              </div>
            )}
          </div>
        )}

        {/* Skip hint (always visible, faint) */}
        {phase !== 'complete' && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '9px',
              color: 'var(--phosphor-dim)',
              opacity: 0.3,
              textTransform: 'uppercase',
            }}
          >
            PRESS ANY KEY TO SKIP
          </div>
        )}
      </div>
    </div>
  )
}

function BootStepLine({
  label,
  status,
  progress,
  visible,
  complete,
}: {
  label: string
  status: string
  progress: number
  visible: boolean
  complete: boolean
}) {
  if (!visible) return null

  const barWidth = 20
  const filled = Math.round(progress * barWidth)
  const empty = barWidth - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)

  // Pad label with dots to align status text
  const maxLabelLen = 38
  const dots = '.'.repeat(Math.max(1, maxLabelLen - label.length))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        fontSize: '11px',
      }}
    >
      {/* Progress bar */}
      <span style={{ color: complete ? 'var(--phosphor)' : 'var(--phosphor-dim)' }}>
        [{bar}]
      </span>

      {/* Label with trailing dots */}
      <span style={{ color: 'var(--phosphor-dim)', whiteSpace: 'nowrap' }}>
        {label}{dots}
      </span>

      {/* Status */}
      <span
        style={{
          color: complete ? 'var(--phosphor)' : 'var(--phosphor-dim)',
          whiteSpace: 'nowrap',
          opacity: complete ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
        className={complete ? 'text-glow' : ''}
      >
        {status}
      </span>
    </div>
  )
}
