import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Auth from './Auth.tsx'
// To preview the auth page instead of the landing page, switch render below:
// import Auth from './Auth.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/** Swap to <Auth /> to preview login/register/forgot page */}
    <Auth />
  </StrictMode>,
)
