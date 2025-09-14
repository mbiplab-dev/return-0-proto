import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api/sachet": {
        target: "https://nerdrr.gov.in/api/sachet.php",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/sachet/, ""),
      },
      "/api/landslide": {
        target: "https://nerdrr.gov.in/api/landslide_event.php",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/landslide/, ""),
      },
    },
  },
})