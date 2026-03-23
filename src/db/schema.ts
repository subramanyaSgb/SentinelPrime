import Dexie, { type EntityTable } from 'dexie'
import type {
  Target,
  ToolResult,
  TimelineEvent,
  Relationship,
  Alert,
  Evidence,
} from '@/types'
import type { AIConversation } from '@/types/ai'

export class SentinelDB extends Dexie {
  targets!: EntityTable<Target, 'id'>
  toolResults!: EntityTable<ToolResult, 'id'>
  timelineEvents!: EntityTable<TimelineEvent, 'id'>
  relationships!: EntityTable<Relationship, 'id'>
  alerts!: EntityTable<Alert, 'id'>
  evidence!: EntityTable<Evidence, 'id'>
  aiConversations!: EntityTable<AIConversation, 'id'>

  constructor() {
    super('SentinelPrimeDB')

    this.version(1).stores({
      targets: 'id, type, name, status, createdAt, updatedAt, threatScore',
      toolResults: 'id, targetId, toolId, category, savedAt, confidence',
      timelineEvents: 'id, targetId, timestamp, source, type, confidence',
      relationships: 'id, sourceId, targetId, type, strength, createdAt',
      alerts: 'id, targetId, type, severity, read, createdAt',
      evidence: 'id, targetId, toolResultId, type, createdAt',
      aiConversations: 'id, targetId, createdAt, updatedAt',
    })
  }
}
