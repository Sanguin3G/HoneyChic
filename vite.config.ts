import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    adonisjs({
      entryPoints: ['inertia/app.ts'],
      serverEntryPoints: ['inertia/ssr.ts'],
      reload: ['resources/views/**/*.edge'],
    }),
  ],
  resolve: { alias: { '~/': `${import.meta.dirname}/inertia/` } },
  server: { watch: { ignored: ['**/.honeychic-tools/**', '**/tmp/**', '**/storage/**'] } },
})
