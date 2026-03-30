import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/babel-fish/',
  server: {
    port: 3000,
    strictPort: false, // If port 3000 is in use, try the next available port
    open: true,
    host: true // Allow access from network
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  },
  define: {
    global: 'globalThis'
  }
}) 