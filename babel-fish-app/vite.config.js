import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/babel-fish/',
  server: {
    port: 3000,
    strictPort: false, // If port 3000 is in use, try the next available port
    open: false,
    host: true // Allow access from network
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  define: {
    global: 'globalThis'
  }
})) 