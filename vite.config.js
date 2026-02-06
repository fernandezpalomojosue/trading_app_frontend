import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  // Agregar esta configuración para producción
  preview: {
    port: 4173,
    historyApiFallback: true,
  },
  build: {
    // Asegurar que el build maneje correctamente las rutas
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})