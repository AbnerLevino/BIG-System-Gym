// Configuração do Vite: a ferramenta que serve o projeto em dev (npm run dev)
// e empacota tudo pra produção (npm run build). O plugin react() ensina o Vite
// a entender JSX/TSX, que o navegador não lê nativamente.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})