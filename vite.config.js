import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import yaml from '@rollup/plugin-yaml'

export default defineConfig({
  plugins: [react(), yaml()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    'import.meta.env.VITE_NETWORK': JSON.stringify(
      process.env.RUNEBASE_NETWORK || 'mainnet'
    )
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.RUNEBASE_EXPLORER_API_BASE_SERVER || 'http://localhost:7001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/socket.io': {
        target: process.env.RUNEBASE_EXPLORER_API_BASE_SERVER || 'http://localhost:7001',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
