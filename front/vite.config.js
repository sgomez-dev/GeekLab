import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: '0.0.0.0',
    port: 32136,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'localhost',
      '15.15.15.7',
      '127.0.0.1'
    ],
    // Open browser automatically (disabled for containerized environments)
    open: false,
    cors: true,
    hmr: {
      // For Kubernetes/Ingress: use environment variable or auto-detect from headers
      // Set VITE_HMR_HOST=geeklab.sgomez.dev in your deployment for domain access
      host: process.env.VITE_HMR_HOST || undefined,
      protocol: process.env.VITE_HMR_PROTOCOL || undefined,
      // Use clientPort for Docker/containerized environments
      clientPort: process.env.VITE_HMR_CLIENT_PORT ? parseInt(process.env.VITE_HMR_CLIENT_PORT) : 32136
    },
    watch: {
      // Improve file watching in Docker
      usePolling: true
    },
    // Add headers to help with proxy/load balancer issues
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  optimizeDeps: {
    // Force re-optimization when dependencies change
    force: process.env.VITE_FORCE_OPTIMIZE === 'true',
    // Include common dependencies that might cause issues
    include: ['axios', 'socket.io-client', 'svelte', 'svelte-spa-router']
  },
  // Build configuration
  build: {
    // Increase chunk size warning limit for large dependencies
    chunkSizeWarningLimit: 1000,
    // Improve build performance
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Log level for debugging
  logLevel: process.env.VITE_LOG_LEVEL || 'info'
})
