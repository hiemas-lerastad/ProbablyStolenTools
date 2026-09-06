import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/ProbablyStolenTools/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ratManager: resolve(import.meta.dirname, 'rat-manager.html'),
        saveEditor: resolve(import.meta.dirname, 'save-editor.html'),
      },
    },
  },
})
