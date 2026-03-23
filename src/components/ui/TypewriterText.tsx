import { useState, useEffect, useRef } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
  style?: React.CSSProperties
}

const DEFAULT_SPEED = 18 // ms per character — per PRD Section 6.5

/**
 * PHANTOM GRID Typewriter Text — character-by-character reveal animation.
 * Speed: 18ms per character (PRD spec).
 * Shows blinking cursor during animation, hides on complete.
 */
export function TypewriterText({
  text,
  speed = DEFAULT_SPEED,
  onComplete,
  className = '',
  style,
}: TypewriterTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const prevTextRef = useRef(text)

  useEffect(() => {
    // Reset if text changes
    if (text !== prevTextRef.current) {
      setDisplayedLength(0)
      setIsComplete(false)
      prevTextRef.current = text
    }
  }, [text])

  useEffect(() => {
    if (displayedLength >= text.length) {
      setIsComplete(true)
      onComplete?.()
      return
    }

    const timer = setTimeout(() => {
      setDisplayedLength((prev) => prev + 1)
    }, speed)

    return () => clearTimeout(timer)
  }, [displayedLength, text, speed, onComplete])

  return (
    <span className={className} style={style}>
      {text.slice(0, displayedLength)}
      {!isComplete && <span className="cursor-blink">_</span>}
    </span>
  )
}

interface TypewriterBlockProps {
  lines: string[]
  lineDelay?: number
  charSpeed?: number
  onComplete?: () => void
  className?: string
}

/**
 * Multi-line typewriter — reveals lines one at a time.
 * Each line types out, then the next line starts.
 */
export function TypewriterBlock({
  lines,
  lineDelay = 200,
  charSpeed = DEFAULT_SPEED,
  onComplete,
  className = '',
}: TypewriterBlockProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [completedLines, setCompletedLines] = useState<string[]>([])
  const [showCurrent, setShowCurrent] = useState(true)

  const handleLineComplete = () => {
    setCompletedLines((prev) => [...prev, lines[currentLine] ?? ''])
    setShowCurrent(false)

    if (currentLine + 1 >= lines.length) {
      onComplete?.()
      return
    }

    setTimeout(() => {
      setCurrentLine((prev) => prev + 1)
      setShowCurrent(true)
    }, lineDelay)
  }

  return (
    <div className={className} style={{ fontFamily: 'var(--font-mono)' }}>
      {completedLines.map((line, i) => (
        <div key={i} style={{ color: 'var(--phosphor-dim)', fontSize: '12px' }}>
          {line}
        </div>
      ))}
      {showCurrent && currentLine < lines.length && (
        <div style={{ color: 'var(--phosphor)', fontSize: '12px' }}>
          <TypewriterText
            text={lines[currentLine] ?? ''}
            speed={charSpeed}
            onComplete={handleLineComplete}
          />
        </div>
      )}
    </div>
  )
}
