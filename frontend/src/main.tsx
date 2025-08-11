import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Auth from './Auth.tsx'
import Dashboard from './Dashboard.tsx'
import ProfileSettings from './ProfileSettings.tsx'
import { RouterProvider, Routes, Route } from './router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfileSettings />} />
      </Routes>
    </RouterProvider>
  </StrictMode>,
)
