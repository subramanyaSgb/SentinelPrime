import { useMemo, useState, useCallback } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Button, Separator } from '@/components/ui'
import type { Target, TargetType } from '@/types'

/**
 * RelationshipMapper — Phase 5.5
 * Visual representation of connections between targets.
 * Uses a simple text-based graph visualization (D3.js full graph deferred to polish phase).
 */

interface Node {
  id: string
  label: string
  type: TargetType
}

interface Edge {
  from: string
  to: string
  label: string
  strength: number
}

const TYPE_ICONS: Record<TargetType, string> = {
  person: '◈',
  domain: '◉',
  org: '◆',
  location: '◎',
  event: '▣',
  generic: '○',
}

export function RelationshipMapper() {
  const targets = useTargetStore((s) => s.targets)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Build nodes from targets
  const nodes: Node[] = useMemo(
    () => targets.map((t) => ({ id: t.id, label: t.name, type: t.type })),
    [targets]
  )

  // Build edges from shared identifiers / aliases
  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = []
    for (let i = 0; i < targets.length; i++) {
      for (let j = i + 1; j < targets.length; j++) {
        const a = targets[i] as Target
        const b = targets[j] as Target
        const connections: string[] = []

        // Shared identifiers
        for (const idA of a.identifiers) {
          for (const idB of b.identifiers) {
            if (idA.value.toLowerCase() === idB.value.toLowerCase()) {
              connections.push(`SHARED ${idA.type.toUpperCase()}`)
            }
          }
        }

        // Shared aliases
        for (const aliasA of a.aliases) {
          if (b.aliases.some((ab) => ab.toLowerCase() === aliasA.toLowerCase())) {
            connections.push('SHARED ALIAS')
          }
        }

        // Shared tags (3+)
        const sharedTags = a.tags.filter((t) => b.tags.includes(t))
        if (sharedTags.length >= 2) {
          connections.push(`${String(sharedTags.length)} SHARED TAGS`)
        }

        if (connections.length > 0) {
          result.push({
            from: a.id,
            to: b.id,
            label: connections.join(' + '),
            strength: Math.min(100, connections.length * 30),
          })
        }
      }
    }
    return result
  }, [targets])

  const selectedNode = selectedNodeId ? targets.find((t) => t.id === selectedNodeId) : null
  const selectedEdges = selectedNodeId
    ? edges.filter((e) => e.from === selectedNodeId || e.to === selectedNodeId)
    : []

  const handleExport = useCallback(() => {
    const data = { nodes, edges }
    void navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }, [nodes, edges])

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        padding: '12px',
      }}
      className="corner-brackets"
    >
      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
        <div
          style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase' }}
          className="text-glow"
        >
          RELATIONSHIP MAPPER
        </div>
        <Button variant="ghost" onClick={handleExport} style={{ fontSize: '9px' }}>
          ⎘ EXPORT JSON
        </Button>
      </div>
      <div
        style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '12px' }}
      >
        {nodes.length} NODES // {edges.length} CONNECTIONS
      </div>

      <Separator />

      {/* Graph visualization (text-based for now) */}
      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Node list */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
            NODES
          </div>
          {nodes.length === 0 ? (
            <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', opacity: 0.5, textTransform: 'uppercase', padding: '16px', textAlign: 'center' }}>
              ○ NO TARGETS TO MAP
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {nodes.map((node) => {
                const edgeCount = edges.filter((e) => e.from === node.id || e.to === node.id).length
                const isSelected = selectedNodeId === node.id

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: isSelected ? 'var(--phosphor-faint)' : 'var(--bg-deep)',
                      border: `1px solid ${isSelected ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      textAlign: 'left',
                      width: '100%',
                      color: 'var(--phosphor)',
                    }}
                  >
                    <span>{TYPE_ICONS[node.type]}</span>
                    <span className="flex-1">{node.label}</span>
                    {edgeCount > 0 && (
                      <span style={{ fontSize: '8px', color: 'var(--phosphor-dim)' }}>
                        {edgeCount} CONN
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Edge list / selected node detail */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
            {selectedNode ? `CONNECTIONS: ${selectedNode.name.toUpperCase()}` : 'ALL CONNECTIONS'}
          </div>

          {(selectedNodeId ? selectedEdges : edges).length === 0 ? (
            <div style={{ fontSize: '9px', color: 'var(--phosphor-dim)', opacity: 0.5, textTransform: 'uppercase', padding: '16px', textAlign: 'center' }}>
              ○ NO CONNECTIONS
              {selectedNode ? ` FOR ${selectedNode.name.toUpperCase()}` : ' FOUND'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(selectedNodeId ? selectedEdges : edges).map((edge, idx) => {
                const fromTarget = targets.find((t) => t.id === edge.from)
                const toTarget = targets.find((t) => t.id === edge.to)
                const strengthColor =
                  edge.strength >= 75 ? 'var(--red-critical)' :
                  edge.strength >= 50 ? 'var(--amber)' :
                  'var(--phosphor)'

                return (
                  <div
                    key={`edge-${String(idx)}`}
                    style={{
                      padding: '6px 8px',
                      background: 'var(--bg-deep)',
                      border: `1px solid ${strengthColor}`,
                      fontSize: '9px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--phosphor)' }}>{fromTarget?.name ?? '?'}</span>
                      <span style={{ color: strengthColor }}>⟷</span>
                      <span style={{ color: 'var(--phosphor)' }}>{toTarget?.name ?? '?'}</span>
                    </div>
                    <div style={{ color: 'var(--phosphor-dim)', marginTop: '2px' }}>
                      {edge.label}
                    </div>
                    <div style={{ color: strengthColor, marginTop: '2px', fontSize: '8px' }}>
                      STRENGTH: {'█'.repeat(Math.round(edge.strength / 10))}{'░'.repeat(10 - Math.round(edge.strength / 10))} {edge.strength}%
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
