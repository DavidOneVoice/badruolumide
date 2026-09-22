import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        choirflo: fileURLToPath(new URL('./index.html', import.meta.url)),
        expenses: fileURLToPath(new URL('./expenses/index.html', import.meta.url)),
      },
    },
  },
})
