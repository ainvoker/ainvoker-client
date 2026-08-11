import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Package exports map is awkward for Vite; pin the browser ESM build.
      'xendit-components-web': path.resolve(
        rootDir,
        'node_modules/xendit-components-web/sdk/dist/esm-bundled/index.mjs',
      ),
    },
  },
  optimizeDeps: {
    include: ['xendit-components-web'],
  },
})
