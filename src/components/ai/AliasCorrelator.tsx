import { useMemo } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Separator } from '@/components/ui'
import type { Target } from '@/types'

/**
 * AliasCorrelator — Phase 5.7
 * Identifies potential alias matches across all targets.
 * Compares identifiers, aliases, and names for correlations.
 */

interface Correlation {
  targetA: { id: string; name: string }
  targetB: { id: string; name: string }
  matches: { type: string; value: string }[]
  strength: number // 0-100
}

export function AliasCorrelator() {
  const targets = useTargetStore((s) => s.targets)

  const correlations = useMemo(() => {
    const results: Correlation[] = []

    for (let i = 0; i < targets.length; i++) {
      for (let j = i + 1; j < targets.length; j++) {
        const a = targets[i] as Target
        const b = targets[j] as Target
        const matches: Correlation['matches'] = []

        // Check shared aliases
        for (const aliasA of a.aliases) {
          if (b.aliases.some((ab) => ab.toLowerCase() === aliasA.toLowerCase())) {
            matches.push({ type: 'SHARED ALIAS', value: aliasA })
          }
          if (b.name.toLowerCase() === aliasA.toLowerCase()) {
            matches.push({ type: 'NAME = ALIAS', value: aliasA })
          }
        }
        for (const aliasB of b.aliases) {
          if (a.name.toLowerCase() === aliasB.toLowerCase()) {
            matches.push({ type: 'NAME = ALIAS', value: aliasB })
          }
        }

        // Check shared identifiers
        for (const idA of a.identifiers) {
          for (const idB of b.identifiers) {
            if (idA.value.toLowerCase() === idB.value.toLowerCase()) {
              matches.push({ type: `SHARED ${idA.type.toUpperCase()}`, value: idA.value })
            }
          }
        }

        // Check shared tags
        const sharedTags = a.tags.filter((t) => b.tags.includes(t))
        if (sharedTags.length >= 3) {
          matches.push({ type: 'SHARED TAGS', value: sharedTags.join(', ') })
        }

        // Name similarity (partial match)
        if (
          a.name.toLowerCase().includes(b.name.toLowerCase()) ||
          b.name.toLowerCase().includes(a.name.toLowerCase())
        ) {
          if (a.name.toLowerCase() !== b.name.toLowerCase()) {
            matches.push({ type: 'NAME OVERLAP', value: `${a.name} ↔ ${b.name}` })
          }
        }

        if (matches.length > 0) {
          const strength = Math.min(100, matches.length * 25)
          results.push({
            targetA: { id: a.id, name: a.name },
            targetB: { id: b.id, name: b.name },
            matches,
            strength,
          })
        }
      }
    }

    return results.sort((a, b) => b.strength - a.strength)
  }, [targets])

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--phosphor-faint)',
        padding: '12px',
      }}
      className="corner-brackets"
    >
      <div
        style={{ fontSize: '11px', color: 'var(--phosphor)', textTransform: 'uppercase', marginBottom: '4px' }}
        className="text-glow"
      >
        ALIAS CORRELATION ENGINE
      </div>
      <div
        style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase', marginBottom: '12px' }}
      >
        {targets.length} TARGETS ANALYZED // {correlations.length} CORRELATIONS FOUND
      </div>

      <Separator />

      <div style={{ marginTop: '12px' }}>
        {correlations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '30px',
              fontSize: '10px',
              color: 'var(--phosphor-dim)',
              textTransform: 'uppercase',
              opacity: 0.5,
            }}
          >
            {targets.length < 2
              ? '○ NEED AT LEAST 2 TARGETS FOR CORRELATION ANALYSIS'
              : '○ NO CORRELATIONS DETECTED BETWEEN TARGETS'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {correlations.map((corr, idx) => {
              const strengthColor =
                corr.strength >= 75 ? 'var(--red-critical)' :
                corr.strength >= 50 ? 'var(--amber)' :
                'var(--phosphor)'

              return (
                <div
                  key={`corr-${String(idx)}`}
                  style={{
                    padding: '8px 10px',
                    background: 'var(--bg-deep)',
                    border: `1px solid ${strengthColor}`,
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--phosphor)', textTransform: 'uppercase' }}>
                      {corr.targetA.name} ⟷ {corr.targetB.name}
                    </div>
                    <div style={{ fontSize: '10px', color: strengthColor, textTransform: 'uppercase' }}>
                      {'█'.repeat(Math.round(corr.strength / 10))}{'░'.repeat(10 - Math.round(corr.strength / 10))} {corr.strength}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {corr.matches.map((match, mi) => (
                      <div
                        key={`match-${String(mi)}`}
                        style={{
                          fontSize: '9px',
                          color: 'var(--phosphor-dim)',
                          textTransform: 'uppercase',
                        }}
                      >
                        ◇ {match.type}: {match.value}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
