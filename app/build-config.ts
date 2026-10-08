import { createServer, defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import preact from '@preact/preset-vite'

const server = await createServer(defineConfig({
  root: import.meta.dirname!,
  plugins: [
    preact({ jsxImportSource: 'preact' }),
    tailwindcss(),
  ],
  server: {
    host: true,
  },
}))

await server.listen(5173)
server.printUrls()
