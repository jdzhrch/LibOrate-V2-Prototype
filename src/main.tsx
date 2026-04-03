import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { PrototypeProvider } from './state/prototypeStore'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <PrototypeProvider>
        <App />
      </PrototypeProvider>
    </HashRouter>
  </StrictMode>,
)
