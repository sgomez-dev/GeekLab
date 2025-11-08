import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 32136,
    strictPort: false,
    allowedHosts: ['geeklab.sgomez.dev'],
    hmr: {
      // Use clientPort for Docker/containerized environments
      clientPort: 32136,
      // Let Vite auto-detect the host from the request headers
      // This ensures HMR works correctly when accessed via domain
      host: process.env.VITE_HMR_HOST || undefined,
      protocol: process.env.VITE_HMR_PROTOCOL || undefined
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
