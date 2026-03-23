export type InputType = 'text' | 'email' | 'url' | 'phone' | 'ip' | 'file' | 'coordinates'
export type DataSourceType = 'free_api' | 'paid_api' | 'ai_only' | 'link_out' | 'scrape'
export type OutputType = 'text' | 'json' | 'map' | 'graph' | 'table' | 'image' | 'mixed'

export interface ModuleInput {
  name: string
  type: InputType
  label: string
  required: boolean
  placeholder: string
}

export interface ModuleDataSource {
  name: string
  type: DataSourceType
  apiKey?: string
  endpoint?: string
}

export interface ModuleSpec {
  id: string
  name: string
  category: string
  categoryId: number
  description: string
  inputs: ModuleInput[]
  dataSources: ModuleDataSource[]
  outputType: OutputType
  aiEnabled: boolean
  aiPrompt?: string
  linkToTarget: boolean
  rateLimit?: string
  requiresApiKey: boolean
  apiKeyName?: string
  tags: string[]
}

export interface ToolResult {
  id: string
  targetId?: string
  toolId: string
  category: string
  input: Record<string, unknown>
  output: Record<string, unknown>
  aiAnalysis?: string
  confidence: number
  sources: string[]
  savedAt: Date
  tags: string[]
}
