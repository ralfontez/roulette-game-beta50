import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Obtenemos el nombre del repositorio del campo homepage
// del package.json para usarlo como base path.
const repoName = '/roulette-game-beta99/' // ⚠️ REEMPLAZA ESTO

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // AÑADE ESTA CONFIGURACIÓN DE BASE 
  base: repoName,
})
