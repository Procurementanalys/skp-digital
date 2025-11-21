import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // PENTING: Base harus sama dengan nama repository Anda
  base: '/skp-digital/', 
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    // Compat for environment variables
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})