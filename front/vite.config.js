import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 32136,
    strictPort: false,
    allowedHosts: [
      'geeklab.sgomez.dev',
      'localhost',
      '15.15.15.7',
      '127.0.0.1'
    ],
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
    }
  },
  optimizeDeps: {
    // Force re-optimization when dependencies change
    force: process.env.VITE_FORCE_OPTIMIZE === 'true',
    // Include common dependencies that might cause issues
    include: ['vue', 'vue-router', 'pinia', 'axios', 'socket.io-client']
  }
})
