import { build, createServer, defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import preact from '@preact/preset-vite'

const config = defineConfig({
  root: import.meta.dirname!,
  plugins: [
    preact({ jsxImportSource: 'preact' }),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

if (Deno.args.includes('build')) {
  await build(config)
} else {
  const server = await createServer(config)
  await server.listen(5173)
  server.printUrls()
}
