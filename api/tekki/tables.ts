import { createTable, sql } from '../schema.ts'

/**
 * Tekki's own tables, kept beside the feature instead of in the shared schema.
 * Imported by the Tekki modules that read or write them.
 */

/** Generated trade logs of the example profiles (`traderId` = handle). */
export const SocialTrade = createTable('socialTrade', {
  tradeId: { type: 'INTEGER', primary: true },
  traderId: { type: 'TEXT' },
  symbol: { type: 'TEXT' },
  side: { type: 'TEXT' }, // 'BUY' | 'SELL'
  quantity: { type: 'INTEGER' },
  priceFcfa: { type: 'REAL' },
  executedAt: { type: 'TEXT' }, // ISO date
  isExample: { type: 'INTEGER' }, // 0 or 1
})

/** Audit log of Tekki answers: provider, sources, guardrail (no content). */
export const AIInteraction = createTable('aiInteraction', {
  interactionId: { type: 'INTEGER', primary: true },
  userId: { type: 'INTEGER', optional: true },
  task: { type: 'TEXT' },
  provider: { type: 'TEXT' },
  model: { type: 'TEXT' },
  language: { type: 'TEXT' },
  contextVersion: { type: 'TEXT' },
  sourcesJson: { type: 'TEXT' },
  guardrailTriggered: { type: 'INTEGER' },
  createdAt: { type: 'TEXT' },
})

sql`CREATE INDEX IF NOT EXISTS idx_social_trade ON socialTrade(traderId, executedAt)`
  .run()
