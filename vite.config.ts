import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // we have our NODE_ENV captured in mode.
  const envObj = loadEnv(mode, process.cwd());
  console.log(`Running process in mode: ${mode}`)
  return {
    plugins: [react()],
    server: {
      port: 5175,
      proxy: {
        '/api': {
          target: mode === 'development' ? 'http://backend:3007' :
            mode === 'staging' ? envObj.VITE_API_STAGING :
            envObj.VITE_API_PROD,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
      },
      host: true,
      watch: {
        usePolling: true,
      },
    }
  }
})
