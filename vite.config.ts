import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // PENTING: Ganti '/skp-digital/' sesuai nama repository GitHub Anda.
  // Jika nama repo Anda "skp-app", ubah menjadi '/skp-app/'
  base: '/skp-digital/', 
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    // This allows process.env.API_KEY to work in Vite if you set it in .env
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})