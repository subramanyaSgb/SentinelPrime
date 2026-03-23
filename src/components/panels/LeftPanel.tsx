import { useAppStore } from '@/store/appStore'
import { useTargetStore } from '@/store/targetStore'
import { LayerToggles } from './LayerToggles'
import type { AppView } from '@/types'

/**
 * PHANTOM GRID Left Panel — Intelligence Navigator.
 *
 * Width: 280px expanded / 48px collapsed (icon strip)
 * Sections: Navigation, Active Targets list
 * Collapse: slides left with mechanical ease, icon strip remains
 */

interface NavItem {
  id: AppView
  label: string
  icon: string
  count?: number
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'MISSION CONTROL', icon: '◎' },
  { id: 'targets', label: 'TARGETS', icon: '◈' },
  { id: 'tools', label: 'TOOLS', icon: '▶' },
  { id: 'intelligence', label: 'INTELLIGENCE', icon: '◆' },
  { id: 'visualizations', label: 'VISUALIZATIONS', icon: '◇' },
  { id: 'settings', label: 'SETTINGS', icon: '⚙' },
]

export function LeftPanel() {
  const isOpen = useAppStore((s) => s.leftPanelOpen)
  const togglePanel = useAppStore((s) => s.toggleLeftPanel)
  const currentView = useAppStore((s) => s.currentView)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const targets = useTargetStore((s) => s.targets)
  const activeTargets = targets.filter((t) => t.status === 'active')

  return (
    <aside
      className="shrink-0 border-r flex flex-col overflow-hidden"
      style={{
        width: isOpen ? 'var(--left-panel-width)' : 'var(--left-panel-collapsed)',
        borderColor: 'var(--phosphor-faint)',
        background: 'var(--bg-deep)',
        transition: 'width 0.25s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {/* Panel header */}
      {isOpen && (
        <div
          className="px-3 py-2 border-b"
          style={{
            borderColor: 'var(--phosphor-faint)',
            fontSize: '10px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
          }}
        >
          <span className="text-glow">INTELLIGENCE NAVIGATOR</span>
          <span style={{ color: 'var(--phosphor-dim)' }}> // NAV</span>
        </div>
      )}

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto py-1">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            isCollapsed={!isOpen}
            onClick={() => setCurrentView(item.id)}
          />
        ))}

        {/* Data layer toggles — visible when expanded and on dashboard view */}
        {isOpen && currentView === 'dashboard' && <LayerToggles />}

        {/* Active targets section */}
        {isOpen && activeTargets.length > 0 && (
          <>
            <div
              className="px-3 py-2 mt-2 border-t"
              style={{
                borderColor: 'var(--phosphor-faint)',
                fontSize: '10px',
                color: 'var(--phosphor-dim)',
                textTransform: 'uppercase',
              }}
            >
              ACTIVE TARGETS // {activeTargets.length}
            </div>
            {activeTargets.slice(0, 8).map((target) => (
              <div
                key={target.id}
                className="px-3 py-1 flex items-center gap-2 cursor-pointer"
                style={{
                  fontSize: '11px',
                  color: 'var(--phosphor-dim)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-overlay)'
                  e.currentTarget.style.color = 'var(--phosphor)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--phosphor-dim)'
                }}
              >
                <span style={{ color: 'var(--phosphor)', fontSize: '8px' }}>●</span>
                <span style={{ textTransform: 'uppercase' }}>
                  {target.name.length > 20 ? target.name.slice(0, 20) + '...' : target.name}
                </span>
              </div>
            ))}
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={togglePanel}
        className="w-full border-t py-2 text-center cursor-pointer"
        style={{
          borderColor: 'var(--phosphor-faint)',
          background: 'transparent',
          color: 'var(--phosphor-dim)',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--phosphor)'
          e.currentTarget.style.background = 'var(--bg-overlay)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--phosphor-dim)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        {isOpen ? '◀ COLLAPSE' : '▶'}
      </button>
    </aside>
  )
}

interface NavButtonProps {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}

function NavButton({ item, isActive, isCollapsed, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 cursor-pointer"
      style={{
        padding: isCollapsed ? '10px 0' : '8px 12px',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        background: isActive ? 'var(--phosphor-faint)' : 'transparent',
        color: isActive ? 'var(--phosphor)' : 'var(--phosphor-dim)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        border: 'none',
        borderLeft: isActive ? '2px solid var(--phosphor)' : '2px solid transparent',
        textShadow: isActive ? '0 0 8px var(--phosphor-glow)' : 'none',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--bg-overlay)'
          e.currentTarget.style.color = 'var(--phosphor)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--phosphor-dim)'
        }
      }}
      title={isCollapsed ? item.label : undefined}
    >
      <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
      {!isCollapsed && <span>{item.label}</span>}
    </button>
  )
}
