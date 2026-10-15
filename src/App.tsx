// Componente raiz: inicializa os dados mockados uma vez (initAllData) e entrega
// a navegacao pro BrowserRouter + AppRoutes.
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { initAllData } from './data'

function App() {
  useEffect(() => {
    initAllData()
  }, [])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
