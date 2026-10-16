import { log } from './lib/log.ts'
import { routeHandler } from './routes.ts'
import { server } from '@01edu/api/server'
import { PORT } from './lib/env.ts'
import { getMarketView } from './market-data.ts'
import { ensureExampleTrades } from './tekki/data.ts'

const apiHandler = server({ log, routeHandler })

export default {
  fetch(req: Request) {
    const url = new URL(req.url)
    return apiHandler(req, url)
  },
}

if (import.meta.main) {
  log.info(`[TekkiTrade Backend] Starting server on port ${PORT}...`)
  // Warm the BRVM cache (brvm.org can be slow), then seed example histories.
  const warmTekki = () =>
    getMarketView().catch((error) =>
      log.warn('[Tekki] BRVM warm-up failed', { error: String(error) })
    ).finally(() => ensureExampleTrades())
  void warmTekki()
  Deno.serve({ port: PORT }, (req) => {
    const url = new URL(req.url)
    return apiHandler(req, url)
  })
}
