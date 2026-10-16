// Componente raiz: inicializa os dados mockados uma vez (inicializarTodosOsDados) e entrega
// a navegacao pro BrowserRouter + AppRoutes.
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { inicializarTodosOsDados } from './data'

function App() {
  useEffect(() => {
    inicializarTodosOsDados()
  }, [])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
