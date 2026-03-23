export type TargetType = 'person' | 'domain' | 'org' | 'location' | 'event' | 'generic'
export type TargetStatus = 'active' | 'archived' | 'resolved'

export interface TargetIdentifier {
  type: string
  value: string
}

export interface Target {
  id: string
  type: TargetType
  name: string
  aliases: string[]
  identifiers: TargetIdentifier[]
  photo?: string
  notes: string
  tags: string[]
  threatScore: number
  status: TargetStatus
  createdAt: Date
  updatedAt: Date
  aiSummary?: string
  aiLastUpdated?: Date
}
