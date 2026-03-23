import { useState, useCallback, useMemo } from 'react'
import { Input, Button, Separator } from '@/components/ui'
import { MODULE_REGISTRY, getCategories, searchModules, getModuleById } from '@/constants/moduleRegistry'
import type { ModuleSpec } from '@/types'

// Module imports
import { EmailProfiler } from './person/EmailProfiler'
import { BreachLookup } from './person/BreachLookup'
import { PhoneIntel } from './person/PhoneIntel'
import { UsernameTracer } from './person/UsernameTracer'
import { MetadataExtractor } from './person/MetadataExtractor'
import { DomainIPIntel } from './domain/DomainIPIntel'
import { IPToMap } from './domain/IPToMap'
import { PhishingAnalyzer } from './domain/PhishingAnalyzer'
import { GoogleDorkBuilder } from './social/GoogleDorkBuilder'
import { WaybackCrawler } from './social/WaybackCrawler'

/**
 * ToolsView — Container for the Tool Registry.
 * Lists all modules, searchable, navigates to module execution.
 */

// Map module IDs to their React components
const MODULE_COMPONENTS: Record<string, React.ComponentType> = {
  'email-profiler': EmailProfiler,
  'breach-lookup': BreachLookup,
  'phone-intel': PhoneIntel,
  'username-tracer': UsernameTracer,
  'metadata-extractor': MetadataExtractor,
  'domain-ip-intel': DomainIPIntel,
  'ip-to-map': IPToMap,
  'phishing-analyzer': PhishingAnalyzer,
  'google-dork-builder': GoogleDorkBuilder,
  'wayback-crawler': WaybackCrawler,
}

export function ToolsView() {
  const [search, setSearch] = useState('')
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<number | null>(null)

  const categories = useMemo(() => getCategories(), [])

  const filtered = useMemo(() => {
    let result: ModuleSpec[]
    if (search.trim()) {
      result = searchModules(search)
    } else if (filterCategory !== null) {
      result = MODULE_REGISTRY.filter((m) => m.categoryId === filterCategory)
    } else {
      result = [...MODULE_REGISTRY]
    }
    return result
  }, [search, filterCategory])

  const handleSelectModule = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedModuleId(null)
  }, [])

  // Module execution view
  if (selectedModuleId) {
    const ModuleComponent = MODULE_COMPONENTS[selectedModuleId]
    const moduleSpec = getModuleById(selectedModuleId)

    return (
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Button variant="ghost" onClick={handleBack} style={{ fontSize: '10px', marginBottom: '12px' }}>
            ◁ BACK TO TOOL REGISTRY
          </Button>

          {ModuleComponent ? (
            <ModuleComponent />
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                border: '1px solid var(--phosphor-faint)',
                background: 'var(--bg-card)',
              }}
              className="corner-brackets"
            >
              <div style={{ fontSize: '14px', color: 'var(--phosphor-dim)', marginBottom: '8px' }}>◇</div>
              <div style={{ fontSize: '11px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {moduleSpec?.name ?? 'UNKNOWN MODULE'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--phosphor-dim)', opacity: 0.5, textTransform: 'uppercase' }}>
                MODULE PENDING IMPLEMENTATION // PHASE 4+
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Tool registry list view
  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{ fontSize: '13px', color: 'var(--phosphor)', textTransform: 'uppercase', marginBottom: '4px' }}
          className="text-glow"
        >
          TOOL REGISTRY
        </div>
        <div
          style={{ fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '16px' }}
        >
          {MODULE_REGISTRY.length} MODULES // {categories.length} CATEGORIES //
          {' '}{Object.keys(MODULE_COMPONENTS).length} ACTIVE
        </div>

        <Separator />

        {/* Search */}
        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <Input
            placeholder="SEARCH MODULES BY NAME, CATEGORY, TAG..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setFilterCategory(null) }}
            prefix=">_"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1" style={{ marginBottom: '12px' }}>
          <button
            onClick={() => { setFilterCategory(null); setSearch('') }}
            style={{
              padding: '3px 8px',
              background: filterCategory === null && !search ? 'var(--phosphor-faint)' : 'var(--bg-card)',
              border: `1px solid ${filterCategory === null && !search ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
              color: filterCategory === null && !search ? 'var(--phosphor)' : 'var(--phosphor-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            ALL ({MODULE_REGISTRY.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setFilterCategory(cat.id); setSearch('') }}
              style={{
                padding: '3px 8px',
                background: filterCategory === cat.id ? 'var(--phosphor-faint)' : 'var(--bg-card)',
                border: `1px solid ${filterCategory === cat.id ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
                color: filterCategory === cat.id ? 'var(--phosphor)' : 'var(--phosphor-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        <Separator />

        {/* Module list */}
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '10px', color: 'var(--phosphor-dim)', textTransform: 'uppercase' }}>
              ○ NO MODULES MATCH SEARCH
            </div>
          ) : (
            filtered.map((mod) => (
              <ModuleListItem
                key={mod.id}
                spec={mod}
                isActive={mod.id in MODULE_COMPONENTS}
                onClick={() => handleSelectModule(mod.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ModuleListItem({
  spec,
  isActive,
  onClick,
}: {
  spec: ModuleSpec
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        background: 'var(--bg-card)',
        border: `1px solid ${isActive ? 'var(--phosphor-faint)' : 'rgba(0, 255, 65, 0.05)'}`,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-mono)',
        width: '100%',
        opacity: isActive ? 1 : 0.5,
        transition: 'border-color 0.15s ease, opacity 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--phosphor-dim)'
        e.currentTarget.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isActive ? 'var(--phosphor-faint)' : 'rgba(0, 255, 65, 0.05)'
        e.currentTarget.style.opacity = isActive ? '1' : '0.5'
      }}
    >
      {/* Status indicator */}
      <span
        style={{
          fontSize: '10px',
          color: isActive ? 'var(--phosphor)' : 'var(--phosphor-dim)',
        }}
      >
        {isActive ? '●' : '○'}
      </span>

      {/* Name + description */}
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
          {spec.name}
        </div>
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
          {spec.description}
        </div>
      </div>

      {/* Category */}
      <span
        style={{
          fontSize: '8px',
          color: 'var(--phosphor-dim)',
          border: '1px solid var(--phosphor-faint)',
          padding: '1px 4px',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        {spec.category}
      </span>

      {/* AI indicator */}
      {spec.aiEnabled && (
        <span style={{ fontSize: '9px', color: 'var(--phosphor-dim)', flexShrink: 0 }}>AI</span>
      )}

      {/* Status badge */}
      <span
        style={{
          fontSize: '8px',
          color: isActive ? 'var(--phosphor)' : 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        {isActive ? '▶ READY' : 'PENDING'}
      </span>
    </button>
  )
}
