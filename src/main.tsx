import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/ui.css'
import './styles/app.css'
import { ColorSchemeProvider } from './theme/ColorScheme'
import { ToastProvider } from './ui/Toast'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorSchemeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ColorSchemeProvider>
  </StrictMode>,
)
