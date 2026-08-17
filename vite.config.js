import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.BACKEND_URL || 'https://traveller-service-vkxfrw4kvq-uc.a.run.app'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            // Heavy animation library
            'vendor-framer':    ['framer-motion'],
            // Map library (leaflet + react-leaflet)
            'vendor-leaflet':   ['leaflet', 'react-leaflet'],
            // React Query
            'vendor-query':     ['@tanstack/react-query'],
            // Date utilities
            'vendor-datefns':   ['date-fns'],
            // Date picker — ~85 KB, split so it only loads for users who open a date picker
            'vendor-daypicker': ['react-day-picker'],
            // React core
            'vendor-react':     ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  }
})
