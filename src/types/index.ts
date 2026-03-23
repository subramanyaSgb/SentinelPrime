export type { Target, TargetType, TargetStatus, TargetIdentifier, TargetCoordinates } from './target'
export type {
  ModuleSpec,
  ModuleInput,
  ModuleDataSource,
  InputType,
  DataSourceType,
  OutputType,
  ToolResult,
} from './module'
export type {
  AIProvider,
  AIProviderType,
  AIHealthResult,
  AIMessage,
  AIConversation,
} from './ai'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Alert {
  id: string
  targetId?: string
  type: string
  title: string
  description: string
  severity: AlertSeverity
  read: boolean
  createdAt: Date
}

export interface TimelineEvent {
  id: string
  targetId: string
  title: string
  description: string
  timestamp: Date
  source: string
  toolResultId?: string
  type: 'finding' | 'manual' | 'system'
  confidence: number
}

export interface Relationship {
  id: string
  sourceId: string
  targetId: string
  type: string
  strength: number
  evidence: string[]
  createdAt: Date
}

export interface Evidence {
  id: string
  targetId?: string
  toolResultId?: string
  type: 'screenshot' | 'document' | 'image' | 'data' | 'note'
  content: string
  hash: string
  chain: ChainEntry[]
  createdAt: Date
}

export interface ChainEntry {
  action: string
  timestamp: Date
  actor: string
  details?: string
}

export type AppView =
  | 'dashboard'
  | 'targets'
  | 'target-detail'
  | 'tools'
  | 'tool-detail'
  | 'intelligence'
  | 'visualizations'
  | 'settings'

export interface APIKeyConfig {
  provider: string
  key: string
  label: string
  configured: boolean
  lastChecked?: Date
  status?: 'valid' | 'invalid' | 'unchecked'
}
