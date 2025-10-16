import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    host: '0.0.0.0', 
    port: 5173,
  },
    build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js'.toLowerCase(),
        chunkFileNames: 'assets/[name]-[hash].js'.toLowerCase(),
        assetFileNames: 'assets/[name]-[hash][extname]'.toLowerCase(),
      },
    },
  },
  plugins: [react()],
  base: './',
})
