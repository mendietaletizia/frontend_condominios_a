import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // host desactivado para no exponer URL de red
  },
  build: {
    // Optimizaciones para producción
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          router: ['react-router-dom'],
          axios: ['axios'],
        },
      },
    },
    // Reducir el límite de advertencia de chunk size
    chunkSizeWarningLimit: 1000,
    // Optimizar para producción
    minify: 'terser',
  },
})