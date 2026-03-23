import { useState, useEffect, useMemo } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Button, Input, Separator, StatusIndicator, Timestamp } from '@/components/ui'
import type { Target, TargetType, TargetStatus } from '@/types'

/**
 * TargetListView — Phase 3.2: Display all targets with search, filter, sort.
 *
 * PRD Section 7.1: Target list with status indicators, threat scores,
 * quick actions, and navigation to detail view.
 */

const TYPE_ICONS: Record<TargetType, string> = {
  person: '◈',
  domain: '◉',
  org: '◆',
  location: '◎',
  event: '▣',
  generic: '○',
}

const STATUS_MAP: Record<TargetStatus, 'online' | 'degraded' | 'offline'> = {
  active: 'online',
  archived: 'degraded',
  resolved: 'offline',
}

type SortField = 'name' | 'updatedAt' | 'createdAt' | 'threatScore'
type SortDir = 'asc' | 'desc'

interface TargetListViewProps {
  onSelectTarget: (targetId: string) => void
  onCreateNew: () => void
}

export function TargetListView({ onSelectTarget, onCreateNew }: TargetListViewProps) {
  const targets = useTargetStore((s) => s.targets)
  const loading = useTargetStore((s) => s.loading)
  const loadTargets = useTargetStore((s) => s.loadTargets)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<TargetType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TargetStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    void loadTargets()
  }, [loadTargets])

  const filtered = useMemo(() => {
    let result = [...targets]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.aliases.some((a) => a.toLowerCase().includes(q)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.identifiers.some((id) => id.value.toLowerCase().includes(q))
      )
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType)
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((t) => t.status === filterStatus)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'updatedAt':
          cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'threatScore':
          cmp = a.threatScore - b.threatScore
          break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [targets, search, filterType, filterStatus, sortField, sortDir])

  return (
    <div style={{ padding: '16px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
        <div
          style={{
            fontSize: '13px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
          }}
          className="text-glow"
        >
          TARGET REGISTRY
        </div>
        <Button variant="primary" onClick={onCreateNew} style={{ fontSize: '10px' }}>
          + NEW TARGET
        </Button>
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        {targets.length} TOTAL // {targets.filter((t) => t.status === 'active').length} ACTIVE //
        {' '}{filtered.length} SHOWING
      </div>

      <Separator />

      {/* Search & Filters */}
      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        <div style={{ marginBottom: '8px' }}>
          <Input
            placeholder="SEARCH TARGETS BY NAME, ALIAS, TAG, IDENTIFIER..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix=">_"
          />
        </div>

        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          {/* Type filter */}
          <FilterSelect
            label="TYPE"
            value={filterType}
            onChange={(v) => setFilterType(v as TargetType | 'all')}
            options={[
              { value: 'all', label: 'ALL TYPES' },
              { value: 'person', label: '◈ PERSON' },
              { value: 'domain', label: '◉ DOMAIN/IP' },
              { value: 'org', label: '◆ ORG' },
              { value: 'location', label: '◎ LOCATION' },
              { value: 'event', label: '▣ EVENT' },
              { value: 'generic', label: '○ GENERIC' },
            ]}
          />

          {/* Status filter */}
          <FilterSelect
            label="STATUS"
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as TargetStatus | 'all')}
            options={[
              { value: 'all', label: 'ALL STATUS' },
              { value: 'active', label: '● ACTIVE' },
              { value: 'archived', label: '● ARCHIVED' },
              { value: 'resolved', label: '○ RESOLVED' },
            ]}
          />

          {/* Sort */}
          <FilterSelect
            label="SORT"
            value={sortField}
            onChange={(v) => setSortField(v as SortField)}
            options={[
              { value: 'updatedAt', label: 'LAST UPDATED' },
              { value: 'createdAt', label: 'CREATED' },
              { value: 'name', label: 'NAME' },
              { value: 'threatScore', label: 'THREAT SCORE' },
            ]}
          />

          <button
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            style={{
              background: 'transparent',
              border: '1px solid var(--phosphor-faint)',
              color: 'var(--phosphor-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              padding: '4px 8px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {sortDir === 'desc' ? '▼ DESC' : '▲ ASC'}
          </button>
        </div>
      </div>

      <Separator />

      {/* Target List */}
      <div style={{ marginTop: '12px' }}>
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              fontSize: '11px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
            }}
          >
            ● LOADING TARGETS...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              fontSize: '11px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
            }}
          >
            {targets.length === 0
              ? '○ NO TARGETS FOUND // CREATE YOUR FIRST TARGET'
              : '○ NO TARGETS MATCH CURRENT FILTERS'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filtered.map((target) => (
              <TargetRow key={target.id} target={target} onClick={() => onSelectTarget(target.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TargetRow({ target, onClick }: { target: Target; onClick: () => void }) {
  const threatColor =
    target.threatScore >= 80
      ? 'var(--red-critical)'
      : target.threatScore >= 50
        ? 'var(--amber)'
        : target.threatScore >= 20
          ? 'var(--phosphor)'
          : 'var(--phosphor-dim)'

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-mono)',
        width: '100%',
        transition: 'border-color 0.15s ease',
      }}
      className="corner-brackets"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--phosphor-dim)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--phosphor-faint)'
      }}
    >
      {/* Type icon */}
      <span style={{ fontSize: '14px', color: 'var(--phosphor)', width: '20px', textAlign: 'center' }}>
        {TYPE_ICONS[target.type]}
      </span>

      {/* Status */}
      <StatusIndicator status={STATUS_MAP[target.status]} label={target.status.toUpperCase()} />

      {/* Name & aliases */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--phosphor)',
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {target.name}
        </div>
        {target.aliases.length > 0 && (
          <div
            style={{
              fontSize: '9px',
              color: 'var(--phosphor-dim)',
              opacity: 0.6,
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            AKA: {target.aliases.join(' // ')}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
        {target.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: '8px',
              color: 'var(--phosphor-dim)',
              border: '1px solid var(--phosphor-faint)',
              padding: '1px 4px',
              textTransform: 'uppercase',
            }}
          >
            {tag}
          </span>
        ))}
        {target.tags.length > 3 && (
          <span style={{ fontSize: '8px', color: 'var(--phosphor-dim)', opacity: 0.5 }}>
            +{target.tags.length - 3}
          </span>
        )}
      </div>

      {/* Threat score */}
      <div style={{ width: '60px', textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: threatColor, textTransform: 'uppercase' }}>
          {target.threatScore}/100
        </div>
        <div
          style={{
            width: '100%',
            height: '3px',
            background: 'var(--phosphor-faint)',
            marginTop: '2px',
          }}
        >
          <div
            style={{
              width: `${target.threatScore}%`,
              height: '100%',
              background: threatColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Identifiers count */}
      <div
        style={{
          fontSize: '9px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          flexShrink: 0,
          width: '40px',
          textAlign: 'center',
        }}
      >
        {target.identifiers.length} ID{target.identifiers.length !== 1 ? 'S' : ''}
      </div>

      {/* Updated timestamp */}
      <div style={{ flexShrink: 0 }}>
        <Timestamp date={target.updatedAt} className="" />
      </div>
    </button>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-1">
      <span
        style={{
          fontSize: '9px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
      >
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '3px 6px',
          background: 'var(--bg-card)',
          border: '1px solid var(--phosphor-faint)',
          color: 'var(--phosphor)',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-deep)' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
