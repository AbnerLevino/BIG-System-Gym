// Ponto de entrada do React: pega a <div id="root"> do index.html e renderiza o <App />
// dentro dela. É a ponte entre o HTML puro e o mundo React.
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'flag-icons/css/flag-icons.min.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)