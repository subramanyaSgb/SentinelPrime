import { db } from '@/db/db'
import type { ToolResult } from '@/types'

/**
 * ToolResult Service — persists tool execution results to IndexedDB.
 * Provides CRUD operations for tool results linked to targets.
 */

/** Save a tool result to IndexedDB */
export async function saveToolResult(result: ToolResult): Promise<void> {
  await db.toolResults.put(result)
}

/** Get all tool results for a target */
export async function getToolResultsByTarget(targetId: string): Promise<ToolResult[]> {
  return db.toolResults.where('targetId').equals(targetId).reverse().sortBy('savedAt')
}

/** Get all tool results for a specific tool */
export async function getToolResultsByTool(toolId: string): Promise<ToolResult[]> {
  return db.toolResults.where('toolId').equals(toolId).reverse().sortBy('savedAt')
}

/** Get a specific tool result by ID */
export async function getToolResultById(id: string): Promise<ToolResult | undefined> {
  return db.toolResults.get(id)
}

/** Delete a tool result */
export async function deleteToolResult(id: string): Promise<void> {
  await db.toolResults.delete(id)
}

/** Get total count of tool results */
export async function getToolResultCount(): Promise<number> {
  return db.toolResults.count()
}

/** Get recent tool results across all targets */
export async function getRecentToolResults(limit = 20): Promise<ToolResult[]> {
  return db.toolResults.orderBy('savedAt').reverse().limit(limit).toArray()
}

/** Clear all tool results for a target */
export async function clearTargetResults(targetId: string): Promise<void> {
  await db.toolResults.where('targetId').equals(targetId).delete()
}
