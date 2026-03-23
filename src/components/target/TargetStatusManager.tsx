import { useState, useCallback } from 'react'
import { useTargetStore } from '@/store/targetStore'
import { Button, StatusIndicator } from '@/components/ui'
import type { TargetStatus } from '@/types'

/**
 * TargetStatusManager — Phase 3.6: Change target status (active/archived/resolved).
 *
 * PRD Section 7.1: Targets have lifecycle states.
 * Active → under investigation.
 * Archived → investigation paused.
 * Resolved → investigation concluded.
 */

const STATUS_OPTIONS: { value: TargetStatus; label: string; icon: string; description: string; statusType: 'online' | 'degraded' | 'offline' }[] = [
  { value: 'active', label: 'ACTIVE', icon: '●', description: 'UNDER ACTIVE INVESTIGATION', statusType: 'online' },
  { value: 'archived', label: 'ARCHIVED', icon: '●', description: 'INVESTIGATION PAUSED', statusType: 'degraded' },
  { value: 'resolved', label: 'RESOLVED', icon: '○', description: 'INVESTIGATION CONCLUDED', statusType: 'offline' },
]

interface TargetStatusManagerProps {
  targetId: string
  currentStatus: TargetStatus
}

export function TargetStatusManager({ targetId, currentStatus }: TargetStatusManagerProps) {
  const updateTarget = useTargetStore((s) => s.updateTarget)
  const [isChanging, setIsChanging] = useState(false)

  const handleChangeStatus = useCallback(
    async (newStatus: TargetStatus) => {
      if (newStatus === currentStatus) {
        setIsChanging(false)
        return
      }
      await updateTarget(targetId, { status: newStatus })
      setIsChanging(false)
    },
    [targetId, currentStatus, updateTarget]
  )

  const current = STATUS_OPTIONS.find((s) => s.value === currentStatus)

  if (!isChanging) {
    return (
      <div className="flex items-center gap-2">
        <StatusIndicator status={current?.statusType ?? 'online'} label={current?.label ?? 'UNKNOWN'} />
        <span style={{ color: 'var(--phosphor-dim)', fontSize: '10px' }}>//</span>
        <span style={{ fontSize: '9px', color: 'var(--phosphor-dim)', textTransform: 'uppercase' }}>
          {current?.description}
        </span>
        <Button variant="ghost" onClick={() => setIsChanging(true)} style={{ fontSize: '9px', marginLeft: '4px' }}>
          ◇ CHANGE
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--phosphor-dim)',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        SET TARGET STATUS
      </div>
      <div className="flex items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => void handleChangeStatus(opt.value)}
            style={{
              padding: '6px 10px',
              background: opt.value === currentStatus ? 'var(--phosphor-faint)' : 'var(--bg-card)',
              border: `1px solid ${opt.value === currentStatus ? 'var(--phosphor)' : 'var(--phosphor-faint)'}`,
              color: opt.value === currentStatus ? 'var(--phosphor)' : 'var(--phosphor-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
        <Button variant="ghost" onClick={() => setIsChanging(false)} style={{ fontSize: '9px' }}>
          ✕ CANCEL
        </Button>
      </div>
    </div>
  )
}
