import { useState, useCallback } from 'react'
import { useAppStore } from '@/store/appStore'
import { TargetListView } from './TargetListView'
import { TargetCreateForm } from './TargetCreateForm'
import { TargetDetailView } from './TargetDetailView'

/**
 * TargetsView — Container component for the Target Manager section.
 *
 * Manages sub-views: list, create, and detail.
 * Wired into CenterContent for the 'targets' and 'target-detail' views.
 */

type TargetSubView = 'list' | 'create' | 'detail'

interface TargetsViewProps {
  initialView?: 'list' | 'detail'
}

export function TargetsView({ initialView = 'list' }: TargetsViewProps) {
  const activeTargetId = useAppStore((s) => s.activeTargetId)
  const setActiveTargetId = useAppStore((s) => s.setActiveTargetId)
  const setCurrentView = useAppStore((s) => s.setCurrentView)

  const [subView, setSubView] = useState<TargetSubView>(
    initialView === 'detail' && activeTargetId ? 'detail' : 'list'
  )

  const handleSelectTarget = useCallback(
    (targetId: string) => {
      setActiveTargetId(targetId)
      setCurrentView('target-detail')
      setSubView('detail')
    },
    [setActiveTargetId, setCurrentView]
  )

  const handleCreateNew = useCallback(() => {
    setSubView('create')
  }, [])

  const handleCreated = useCallback(
    (targetId: string) => {
      setActiveTargetId(targetId)
      setCurrentView('target-detail')
      setSubView('detail')
    },
    [setActiveTargetId, setCurrentView]
  )

  const handleBack = useCallback(() => {
    setCurrentView('targets')
    setSubView('list')
  }, [setCurrentView])

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '16px 0' }}>
      {subView === 'list' && (
        <TargetListView onSelectTarget={handleSelectTarget} onCreateNew={handleCreateNew} />
      )}
      {subView === 'create' && (
        <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
          <TargetCreateForm
            onCreated={handleCreated}
            onCancel={() => setSubView('list')}
          />
        </div>
      )}
      {subView === 'detail' && activeTargetId && (
        <TargetDetailView targetId={activeTargetId} onBack={handleBack} />
      )}
    </div>
  )
}
