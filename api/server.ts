import { log } from './lib/log.ts'
import { routeHandler } from './routes.ts'
import { server } from '@01edu/api/server'
import { serveDir, serveFile } from '@std/http/file-server'
import { fromFileUrl } from '@std/path'
import { PORT } from './lib/env.ts'
import './task-seed.ts'

const apiHandler = server({ log, routeHandler })

/** Built PWA (`deno task build`), served on the same origin as the API. */
const APP_DIST = fromFileUrl(new URL('../app/dist', import.meta.url))

const serveApp = async (req: Request, url: URL) => {
  const res = await serveDir(req, { fsRoot: APP_DIST, quiet: true })
  if (url.pathname === '/sw.js') {
    res.headers.set('Cache-Control', 'no-cache')
  } else if (url.pathname.startsWith('/assets/')) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  // Client-side routes (/market, /portfolio…) fall back to the app shell.
  if (res.status === 404 && !url.pathname.includes('.')) {
    return serveFile(req, `${APP_DIST}/index.html`)
  }
  return res
}

const handle = (req: Request) => {
  const url = new URL(req.url)
  return url.pathname.startsWith('/api')
    ? apiHandler(req, url)
    : serveApp(req, url)
}

export default { fetch: handle }

if (import.meta.main) {
  log.info(`[TekkiTrade Backend] Starting server on port ${PORT}...`)
  Deno.serve({ port: PORT }, handle)
}
