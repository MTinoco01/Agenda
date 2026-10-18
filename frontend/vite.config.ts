import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Em dev, /api vai para o Spring Boot: mesma origem, sem CORS
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
