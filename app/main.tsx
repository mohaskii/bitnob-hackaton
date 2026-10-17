import { render } from 'preact'
import { App } from './App.tsx'

const root = document.getElementById('app')
if (!root) throw Error('unable to find root element #app')
render(<App />, root)

// Offline shell + installability. Skipped in dev so Vite HMR is never cached.
const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env
  ?.DEV
if ('serviceWorker' in navigator && !isDev) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
