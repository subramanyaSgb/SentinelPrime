import { type ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'

/**
 * PHANTOM GRID Right Panel — Context Engine.
 *
 * Width: 360px expanded / 0px collapsed
 * Content switches based on active state:
 *   Tool Result / AI Chat / Target Profile / Alert Detail
 * Header: [RESULT] EMAIL_PROFILER // TARGET: JOHN_DOE
 * Collapse: slides right
 */

interface RightPanelProps {
  children?: ReactNode
}

export function RightPanel({ children }: RightPanelProps) {
  const isOpen = useAppStore((s) => s.rightPanelOpen)
  const togglePanel = useAppStore((s) => s.toggleRightPanel)
  const activeToolId = useAppStore((s) => s.activeToolId)

  return (
    <aside
      className="shrink-0 border-l flex flex-col overflow-hidden"
      style={{
        width: isOpen ? 'var(--right-panel-width)' : '0px',
        borderColor: isOpen ? 'var(--phosphor-faint)' : 'transparent',
        background: 'var(--bg-deep)',
        transition: 'width 0.2s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {isOpen && (
        <>
          {/* Panel header */}
          <div
            className="px-3 py-2 border-b flex items-center justify-between shrink-0"
            style={{
              borderColor: 'var(--phosphor-faint)',
              fontSize: '10px',
            }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--phosphor)' }} className="text-glow">
                CONTEXT ENGINE
              </span>
              {activeToolId && (
                <>
                  <span style={{ color: 'var(--phosphor-dim)' }}>//</span>
                  <span
                    style={{
                      color: 'var(--phosphor-dim)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {activeToolId}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={togglePanel}
              className="cursor-pointer"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--phosphor-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--phosphor)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--phosphor-dim)'
              }}
            >
              CLOSE ▶
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-3">
            {children ?? <RightPanelEmpty />}
          </div>
        </>
      )}
    </aside>
  )
}

/** Empty state when no context is active */
function RightPanelEmpty() {
  return (
    <div
      className="h-full flex items-center justify-center"
      style={{
        color: 'var(--phosphor-dim)',
        fontSize: '11px',
        textAlign: 'center',
        opacity: 0.4,
      }}
    >
      <div>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>◇</div>
        <div style={{ textTransform: 'uppercase' }}>NO ACTIVE CONTEXT</div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>
          SELECT A TARGET OR RUN A TOOL
        </div>
      </div>
    </div>
  )
}

/**
 * Toggle button to open the right panel from the main area.
 * Shown when the right panel is closed.
 */
export function RightPanelToggle() {
  const isOpen = useAppStore((s) => s.rightPanelOpen)
  const togglePanel = useAppStore((s) => s.toggleRightPanel)

  if (isOpen) return null

  return (
    <button
      onClick={togglePanel}
      className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
      style={{
        background: 'var(--bg-deep)',
        border: '1px solid var(--phosphor-faint)',
        borderRight: 'none',
        color: 'var(--phosphor-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        padding: '12px 4px',
        zIndex: 10,
        writingMode: 'vertical-lr',
        textOrientation: 'mixed',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--phosphor)'
        e.currentTarget.style.borderColor = 'var(--phosphor)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--phosphor-dim)'
        e.currentTarget.style.borderColor = 'var(--phosphor-faint)'
      }}
    >
      ◀ CONTEXT
    </button>
  )
}
