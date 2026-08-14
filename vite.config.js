import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites at https://<user>.github.io/<repo>/
  // so assets must be requested from that sub-path rather than the domain root.
  base: '/ProbablyStolenGameRatManager/',
})
