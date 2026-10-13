import { DATABASE_PATH } from './lib/env.ts'

/** Deletes the local SQLite database, then re-seeds it from scratch. */
if (DATABASE_PATH !== ':memory:') {
  for (const suffix of ['', '-wal', '-shm']) {
    await Deno.remove(`${DATABASE_PATH}${suffix}`).catch(() => {})
  }
  console.log(`[DB Reset] Removed ${DATABASE_PATH}`)
}
await import('./task-seed.ts')
