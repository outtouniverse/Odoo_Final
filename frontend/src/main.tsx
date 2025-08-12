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
import { AuthProvider } from './utils/auth.tsx'
import Admin from './pages/Admin.tsx'
import CitySearch from './pages/CitySearch.tsx'
import ActivitySearch from './pages/ActivitySearch.tsx'
import TripBudget from './pages/TripBudget.tsx'
import TripCalendar from './pages/TripCalendar.tsx'
import PublicItinerary from './pages/PublicItinerary.tsx'
import MyTripCart from './components/MyTripCart.tsx'
import Trips from './pages/Trips.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { ToastContainer } from './components/Toast.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TripProvider>
        <RouterProvider>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/new-trip" element={<NewTrip />} />
            <Route path="/trip-plan" element={<TripPlan />} />
            <Route path="/itinerary" element={<ItineraryBento />} />
            <Route path="/cities" element={
              <ProtectedRoute>
                <>
                  <CitySearch />
                  <MyTripCart />
                </>
              </ProtectedRoute>
            } />
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
            <Route path="/trips" element={<Trips />} />
          </Routes>
        </RouterProvider>
      </TripProvider>
    </AuthProvider>
  </StrictMode>,
)
