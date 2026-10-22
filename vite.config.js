import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: true,   // écoute sur toutes les interfaces
    port: 5173
  }
})
