import { useAppStore } from '@/store/appStore'
import { SettingsView } from '@/components/settings'
import { GlobeLoader } from '@/components/globe'
import { TargetsView } from '@/components/target'
import type { AppView } from '@/types'

/**
 * Center content area — renders the active view.
 * Implemented views render their full component; others show placeholders.
 */
export function CenterContent() {
  const currentView = useAppStore((s) => s.currentView)

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative"
      style={{ background: 'var(--bg-void)' }}
    >
      {currentView === 'dashboard' ? (
        <GlobeLoader />
      ) : currentView === 'settings' ? (
        <SettingsView />
      ) : currentView === 'targets' ? (
        <TargetsView initialView="list" />
      ) : currentView === 'target-detail' ? (
        <TargetsView initialView="detail" />
      ) : (
        <ViewPlaceholder view={currentView} />
      )}
    </div>
  )
}

function ViewPlaceholder({ view }: { view: AppView }) {
  const viewMeta: Record<AppView, { title: string; description: string; icon: string }> = {
    dashboard: {
      title: 'MISSION CONTROL',
      description: 'GLOBE + ACTIVE TARGETS + ALERT FEED',
      icon: '◎',
    },
    targets: {
      title: 'TARGET MANAGER',
      description: 'CREATE AND MANAGE INTELLIGENCE TARGETS',
      icon: '◈',
    },
    'target-detail': {
      title: 'TARGET DETAIL',
      description: 'FULL TARGET PROFILE AND TOOL RESULTS',
      icon: '◈',
    },
    tools: {
      title: 'TOOL REGISTRY',
      description: '147 CATEGORIES // 1462 MODULES',
      icon: '▶',
    },
    'tool-detail': {
      title: 'TOOL EXECUTION',
      description: 'RUN TOOL AND VIEW RESULTS',
      icon: '▶',
    },
    intelligence: {
      title: 'INTELLIGENCE CENTER',
      description: 'REPORTS // EVIDENCE VAULT // EXPORT',
      icon: '◆',
    },
    visualizations: {
      title: 'VISUALIZATIONS',
      description: 'RELATIONSHIP GRAPH // TIMELINE // MAP',
      icon: '◇',
    },
    settings: {
      title: 'SETTINGS',
      description: 'API KEYS // AI CONFIG // OPSEC',
      icon: '⚙',
    },
  }

  const meta = viewMeta[view]

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div
          style={{
            fontSize: '32px',
            color: 'var(--phosphor)',
            marginBottom: '16px',
            opacity: 0.3,
          }}
        >
          {meta.icon}
        </div>
        <div
          className="text-glow"
          style={{
            color: 'var(--phosphor)',
            fontSize: '14px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          {meta.title}
        </div>
        <div
          style={{
            color: 'var(--phosphor-dim)',
            fontSize: '11px',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          {meta.description}
        </div>
        <div
          style={{
            color: 'var(--phosphor-dim)',
            fontSize: '10px',
            marginTop: '16px',
            opacity: 0.25,
          }}
        >
          MODULE PENDING IMPLEMENTATION
        </div>
      </div>
    </div>
  )
}
