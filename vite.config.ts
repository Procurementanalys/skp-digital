import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/skp-digital/', // IMPORTANT: Matches your GitHub repo name for Pages
  define: {
    // This allows process.env.API_KEY to work in Vite if you set it in .env
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})