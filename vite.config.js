import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/ProbablyStolenTools/',
  build: {
    rollupOptions: {
      input: {
        ratManager: resolve(__dirname, 'rat-manager.html'),
        saveEditor: resolve(__dirname, 'save-editor.html'),
      },
    },
  },
})
