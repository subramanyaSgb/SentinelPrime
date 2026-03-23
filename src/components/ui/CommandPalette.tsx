import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTargetStore } from '@/store/targetStore'
import { MODULE_REGISTRY } from '@/constants/moduleRegistry'
import type { AppView } from '@/types'

interface CommandItem {
  id: string
  category: string
  title: string
  subtitle?: string
  type: 'view' | 'module' | 'target' | 'action'
  action: () => void
}

const NAVIGATION_VIEWS: Array<{ id: AppView; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'targets', label: 'Targets' },
  { id: 'tools', label: 'Tools' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'visualizations', label: 'Visualizations' },
  { id: 'settings', label: 'Settings' },
]

/**
 * PHANTOM GRID Command Palette — Ctrl+K / Cmd+K accessible search across:
 * - Navigation views
 * - Modules from registry
 * - Targets from store
 * - Quick actions
 *
 * Uses fuzzy matching with simple includes() for search.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setActiveTargetId = useAppStore((s) => s.setActiveTargetId)
  const setActiveToolId = useAppStore((s) => s.setActiveToolId)

  const targets = useTargetStore((s) => s.targets)
  const createTarget = useTargetStore((s) => s.createTarget)

  // Global keyboard listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey
      if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery('')
        setSelectedIndex(0)
      }

      // Close on Escape
      if (e.key === 'Escape' && open) {
        setOpen(false)
        setQuery('')
      }

      // Keyboard navigation
      if (!open) return

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : commands.length - 1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < commands.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (commands[selectedIndex]) {
          commands[selectedIndex].action()
          setOpen(false)
          setQuery('')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, query])

  // Focus input when palette opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Build command list based on query
  const commands = buildCommands(
    query,
    setCurrentView,
    setActiveTargetId,
    setActiveToolId,
    targets,
    createTarget
  )

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16"
      style={{ background: 'rgba(2, 8, 2, 0.8)' }}
      onClick={() => {
        setOpen(false)
        setQuery('')
      }}
    >
      {/* Command palette panel */}
      <div
        className="phantom-panel corner-brackets corner-brackets-bottom w-full max-w-2xl"
        style={{
          background: 'var(--bg-void)',
          border: '1px solid var(--phosphor)',
          boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--phosphor-faint)',
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{
              background: 'var(--bg-void)',
              border: '1px solid var(--phosphor-faint)',
              padding: '0 12px',
              transition: 'border-color 0.2s ease',
            }}
          >
            <span
              style={{
                color: 'var(--phosphor)',
                fontSize: '13px',
                userSelect: 'none',
                flexShrink: 0,
              }}
            >
              ⌐_
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder="Search modules, targets, views..."
              className="phantom-input"
              style={{
                border: 'none',
                background: 'transparent',
                padding: '8px 0',
                flex: 1,
              }}
              autoComplete="off"
            />
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--phosphor-dim)',
              marginTop: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            ↑↓ navigate • enter select • esc close • ctrl+k toggle
          </div>
        </div>

        {/* Results list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 0',
          }}
        >
          {commands.length === 0 ? (
            <div
              style={{
                padding: '24px 16px',
                color: 'var(--phosphor-dim)',
                textAlign: 'center',
                fontSize: '12px',
                textTransform: 'uppercase',
              }}
            >
              ○ NO RESULTS FOUND
            </div>
          ) : (
            commands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <CommandItem
                  key={cmd.id}
                  command={cmd}
                  isSelected={isSelected}
                  onSelect={() => {
                    cmd.action()
                    setOpen(false)
                    setQuery('')
                  }}
                  onHover={() => setSelectedIndex(idx)}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

interface CommandItemProps {
  command: CommandItem
  isSelected: boolean
  onSelect: () => void
  onHover: () => void
}

function CommandItem({ command, isSelected, onSelect, onHover }: CommandItemProps) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      style={{
        width: '100%',
        padding: '10px 16px',
        background: isSelected ? 'rgba(0, 255, 65, 0.1)' : 'transparent',
        border: 'none',
        borderLeft: isSelected ? '2px solid var(--phosphor)' : '2px solid transparent',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.1s ease',
      }}
    >
      <div
        style={{
          color: isSelected ? 'var(--phosphor)' : 'var(--phosphor-dim)',
          fontSize: '12px',
          fontWeight: isSelected ? '500' : '400',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '2px',
        }}
      >
        {command.title}
      </div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          fontSize: '11px',
          color: isSelected ? 'var(--phosphor-faint)' : 'var(--phosphor-dim)',
        }}
      >
        <span
          style={{
            padding: '2px 6px',
            background: 'rgba(0, 255, 65, 0.15)',
            border: '1px solid var(--phosphor-faint)',
            borderRadius: '2px',
            fontSize: '10px',
            textTransform: 'uppercase',
          }}
        >
          {command.category}
        </span>
        {command.subtitle && (
          <>
            <span style={{ color: 'var(--phosphor-faint)' }}>•</span>
            <span>{command.subtitle}</span>
          </>
        )}
      </div>
    </button>
  )
}

/**
 * Build filtered command list based on search query
 */
function buildCommands(
  query: string,
  setCurrentView: (view: AppView) => void,
  setActiveTargetId: (id: string | null) => void,
  setActiveToolId: (id: string | null) => void,
  targets: any[],
  createTarget: (target: any) => Promise<any>
): CommandItem[] {
  const commands: CommandItem[] = []
  const lowerQuery = query.toLowerCase()

  // Navigation views
  for (const view of NAVIGATION_VIEWS) {
    if (!lowerQuery || view.label.toLowerCase().includes(lowerQuery)) {
      commands.push({
        id: `view-${view.id}`,
        category: 'NAVIGATION',
        title: view.label,
        type: 'view',
        action: () => setCurrentView(view.id),
      })
    }
  }

  // Modules from registry
  for (const module of MODULE_REGISTRY) {
    const matchesQuery =
      !lowerQuery ||
      module.name.toLowerCase().includes(lowerQuery) ||
      module.description.toLowerCase().includes(lowerQuery) ||
      module.category.toLowerCase().includes(lowerQuery) ||
      module.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))

    if (matchesQuery) {
      commands.push({
        id: `module-${module.id}`,
        category: module.category,
        title: module.name,
        subtitle: module.description,
        type: 'module',
        action: () => {
          setCurrentView('tools')
          setActiveToolId(module.id)
        },
      })
    }
  }

  // Targets from store
  for (const target of targets) {
    if (!lowerQuery || target.name.toLowerCase().includes(lowerQuery)) {
      commands.push({
        id: `target-${target.id}`,
        category: 'TARGETS',
        title: target.name,
        subtitle: target.type,
        type: 'target',
        action: () => {
          setCurrentView('target-detail')
          setActiveTargetId(target.id)
        },
      })
    }
  }

  // Quick actions
  const quickActions: CommandItem[] = [
    {
      id: 'action-new-target',
      category: 'ACTIONS',
      title: 'Create New Target',
      type: 'action',
      action: async () => {
        const newTarget = await createTarget({
          name: query || 'Unnamed Target',
          type: 'person',
          status: 'active',
          notes: '',
          tags: [],
        })
        setCurrentView('target-detail')
        setActiveTargetId(newTarget.id)
      },
    },
    {
      id: 'action-clear-search',
      category: 'ACTIONS',
      title: 'Clear Search',
      type: 'action',
      action: () => {
        // Clearing is implicit in parent component
      },
    },
  ]

  for (const action of quickActions) {
    if (!lowerQuery || action.title.toLowerCase().includes(lowerQuery)) {
      commands.push(action)
    }
  }

  return commands
}
