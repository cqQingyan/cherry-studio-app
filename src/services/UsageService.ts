import { sql } from 'drizzle-orm'
import { eq } from 'drizzle-orm'

import { db } from '@db'
import { messages } from '@db/schema'
import type { Usage } from '@/types/assistant'

export type ModelUsageStat = {
  modelId: string
  totalTokens: number
  totalCost: number // In generic units, simplistic
  messageCount: number
}

export const UsageService = {
  /**
   * Get usage statistics grouped by model.
   * Note: This calculates total usage from the beginning of time.
   */
  async getUsageStats(): Promise<ModelUsageStat[]> {
    try {
      // 1. Fetch all messages that have usage data
      // We do this in JS because parsing JSON in SQLite is tricky across versions
      const allMessages = await db.query.messages.findMany({
        where: (messages, { isNotNull }) => isNotNull(messages.usage),
        columns: {
          model_id: true,
          usage: true
        }
      })

      const statsMap: Record<string, ModelUsageStat> = {}

      for (const msg of allMessages) {
        if (!msg.usage || !msg.model_id) continue

        let usage: Usage | null = null
        try {
          usage = JSON.parse(msg.usage as string)
        } catch (e) {
          continue
        }

        if (!usage || !usage.total_tokens) continue

        const modelId = msg.model_id

        if (!statsMap[modelId]) {
          statsMap[modelId] = {
            modelId,
            totalTokens: 0,
            totalCost: 0,
            messageCount: 0
          }
        }

        statsMap[modelId].totalTokens += usage.total_tokens || 0
        statsMap[modelId].messageCount += 1

        // Accumulate cost if available in the usage object (e.g. from OpenRouter)
        if (usage.cost) {
            statsMap[modelId].totalCost += usage.cost
        }
      }

      return Object.values(statsMap).sort((a, b) => b.totalTokens - a.totalTokens)
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return []
    }
  }
}
