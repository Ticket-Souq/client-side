import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './features/events/styles/events.css'
import App from './App.tsx'
import GlobalLoading from './shared/components/GlobalLoading'
import { BRAND_NAME } from './shared/constants'

document.title = BRAND_NAME

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalLoading />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
