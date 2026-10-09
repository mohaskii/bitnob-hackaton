import { log } from './lib/log.ts'
import { routeHandler } from './routes.ts'
import { server } from '@01edu/api/server'
import { PORT } from './lib/env.ts'

const apiHandler = server({ log, routeHandler })

export default {
  fetch(req: Request) {
    const url = new URL(req.url)
    return apiHandler(req, url)
  },
}

if (import.meta.main) {
  log.info(`[TekkiTrade Backend] Starting server on port ${PORT}...`)
  Deno.serve({ port: PORT }, (req) => {
    const url = new URL(req.url)
    return apiHandler(req, url)
  })
}
