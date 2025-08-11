import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Auth from './pages/Auth.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ProfileSettings from './pages/ProfileSettings.tsx'
import { RouterProvider, Routes, Route } from "./utils/router.tsx"
import NewTrip from './pages/NewTrip.tsx'
import TripPlan from './pages/TripPlan.tsx'
import ItineraryBento from './pages/ItineraryBento.tsx'
import { TripProvider } from './utils/TripContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TripProvider>
      <RouterProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/new-trip" element={<NewTrip />} />
          <Route path="/trip-plan" element={<TripPlan />} />
          <Route path="/itinerary" element={<ItineraryBento />} />
        </Routes>
      </RouterProvider>
    </TripProvider>
  </StrictMode>,
)
