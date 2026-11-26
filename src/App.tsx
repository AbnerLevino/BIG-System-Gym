// Componente raiz: entrega a navegacao pro BrowserRouter + AppRoutes.
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { inicializarTodosOsDados } from './data'

// Roda uma vez, antes da primeira tela desenhar: assim nenhuma página chega a ler
// dado salvo num formato antigo antes da troca de versão do seed.
inicializarTodosOsDados()

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
