import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './src/index.css'
import App from './src/App.tsx'
import Auth from './src/pages/Auth.tsx'
import Dashboard from './src/pages/Dashboard.tsx'
import ProfileSettings from './src/pages/ProfileSettings.tsx'
import { RouterProvider, Routes, Route } from "./src/utils/router.tsx"
import NewTrip from './src/pages/NewTrip.tsx'
import TripPlan from './src/pages/TripPlan.tsx'
import ItineraryBento from './src/pages/ItineraryBento.tsx'
import { TripProvider } from './src/utils/TripContext.tsx'
import { AuthProvider } from './src/utils/auth.tsx'
import Admin from './src/pages/Admin.tsx'
import CitySearch from './src/pages/CitySearch.tsx'
import ActivitySearch from './src/pages/ActivitySearch.tsx'
import TripBudget from './src/pages/TripBudget.tsx'
import TripCalendar from './src/pages/TripCalendar.tsx'
import PublicItinerary from './src/pages/PublicItinerary.tsx'
import MyTripCart from './src/components/MyTripCart.tsx'
import Trips from './src/pages/Trips.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TripProvider>
        <RouterProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/new-trip" element={<NewTrip />} />
            <Route path="/trip-plan" element={<TripPlan />} />
            <Route path="/itinerary" element={<ItineraryBento />} />
            <Route path="/cities" element={<>
              <CitySearch />
              <MyTripCart />
            </>} />
            <Route path="/activities" element={<>
              <ActivitySearch />
              <MyTripCart />
            </>} />
            <Route path="/budget" element={<>
              <TripBudget />
              <MyTripCart />
            </>} />
            <Route path="/calendar" element={<>
              <TripCalendar />
              <MyTripCart />
            </>} />
            <Route path="/public-itinerary" element={<>
              <PublicItinerary />
              <MyTripCart />
            </>} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </RouterProvider>
      </TripProvider>
    </AuthProvider>
  </StrictMode>,
)
