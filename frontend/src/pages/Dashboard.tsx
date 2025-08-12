import { useState, useEffect } from 'react'
import Header from '../components/Header.tsx'
import Sidebar from '../components/Sidebar.tsx'
import TripCard, { type Trip } from '../components/TripCard.tsx'
import StatsCard from '../components/StatsCard.tsx'
import DestinationCard from '../components/DestinationCard.tsx'
import { Link } from '../utils/router.tsx'
import { apiFetch } from '../utils/api.ts'

// Types for backend data
interface BackendTrip {
  _id: string
  name: string
  startDate: string
  endDate: string
  selectedCities: Array<{ id: string; name: string; country: string }>
  coverPhoto?: string
  budget: { amount: number; currency: string }
  status: string
}

interface DashboardStats {
  totalTrips: number
  upcomingCities: number
  totalBudget: { amount: number; currency: string }
}

interface DashboardData {
  upcomingTrips: {
    count: number
    trips: BackendTrip[]
  }
  statistics: {
    totalTrips: number
    completedTrips: number
    planningTrips: number
    savedDestinationsCount: number
  }
  budget: {
    totalSpent: number
    upcomingExpenses: number
    overview: {
      totalBudget: number
      averageBudget: number
      minBudget: number
      maxBudget: number
    }
  }
  recommendations?: {
    popularCities: Array<{ name: string; country: string; image: string }>
  }
}

// Helper function to convert backend trip to frontend trip
function convertBackendTrip(backendTrip: BackendTrip): Trip {
  const startDate = new Date(backendTrip.startDate)
  const endDate = new Date(backendTrip.endDate)
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  const dateRange = `${formatDate(startDate)} — ${formatDate(endDate)}, ${endDate.getFullYear()}`
  
  // Get relevant cover image for the trip
  let coverUrl = backendTrip.coverPhoto;
  
  // If no cover photo, try to get image from first city
  if (!coverUrl && backendTrip.selectedCities && backendTrip.selectedCities.length > 0) {
    const firstCity = backendTrip.selectedCities[0];
    coverUrl = getCityImage(firstCity.name, firstCity.country);
  }
  
  // If still no image, use a generic travel image
  if (!coverUrl) {
    coverUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
  }
  
  return {
    id: backendTrip._id,
    name: backendTrip.name,
    dateRange,
    destinations: backendTrip.selectedCities?.length || 0,
    coverUrl
  }
}

// Helper function to format budget
function formatBudget(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function getCachedUser() {
  try {
    const raw = localStorage.getItem('currentUser')
    if (!raw) return { name: 'Traveler', avatar: '' }
    const u = JSON.parse(raw)
    return { name: u?.name || 'Traveler', avatar: u?.avatar || '' }
  } catch {
    return { name: 'Traveler', avatar: '' }
  }
}

// Function to get relevant images for cities
function getCityImage(cityName: string, country: string, existingImage?: string): string {
  // If we have an existing image, use it
  if (existingImage && existingImage.trim()) {
    return existingImage;
  }

  // Fallback to relevant stock images based on city/country
  const cityLower = cityName.toLowerCase();
  const countryLower = country.toLowerCase();
  
  // Popular cities with specific images
  if (cityLower.includes('paris') || countryLower.includes('france')) {
    return 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('tokyo') || countryLower.includes('japan')) {
    return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('new york') || cityLower.includes('nyc') || countryLower.includes('usa')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('london') || countryLower.includes('uk') || countryLower.includes('england')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('rome') || cityLower.includes('milan') || countryLower.includes('italy')) {
    return 'https://images.unsplash.com/photo-1552832230-cb7a4b0b8046?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('barcelona') || cityLower.includes('madrid') || countryLower.includes('spain')) {
    return 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('amsterdam') || countryLower.includes('netherlands')) {
    return 'https://images.unsplash.com/photo-1512470876302-972faa2aa9ee?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('berlin') || countryLower.includes('germany')) {
    return 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('prague') || countryLower.includes('czech')) {
    return 'https://images.unsplash.com/photo-1518433957232-3107f5fd5995?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('vienna') || countryLower.includes('austria')) {
    return 'https://images.unsplash.com/photo-1516550893923-e4c698aa90d7?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('budapest') || countryLower.includes('hungary')) {
    return 'https://images.unsplash.com/photo-1551867633-194f125696db?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('dubai') || countryLower.includes('uae')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('singapore')) {
    return 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('bangkok') || countryLower.includes('thailand')) {
    return 'https://images.unsplash.com/photo-1508009603885-50cf7c079365?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('sydney') || countryLower.includes('australia')) {
    return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('toronto') || cityLower.includes('vancouver') || countryLower.includes('canada')) {
    return 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('rio') || cityLower.includes('sao paulo') || countryLower.includes('brazil')) {
    return 'https://images.unsplash.com/photo-1483729558449-99ef09a6c49d?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('mexico') || countryLower.includes('mexico')) {
    return 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('cairo') || countryLower.includes('egypt')) {
    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('marrakech') || countryLower.includes('morocco')) {
    return 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('istanbul') || countryLower.includes('turkey')) {
    return 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('moscow') || countryLower.includes('russia')) {
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('beijing') || cityLower.includes('shanghai') || countryLower.includes('china')) {
    return 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('seoul') || countryLower.includes('korea')) {
    return 'https://images.unsplash.com/photo-1538485399081-7c8cebdbea20?w=400&h=300&fit=crop';
  }
  if (cityLower.includes('mumbai') || cityLower.includes('delhi') || countryLower.includes('india')) {
    return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop';
  }
  
  // Generic fallbacks based on region
  if (countryLower.includes('europe')) {
    return 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop';
  }
  if (countryLower.includes('asia')) {
    return 'https://images.unsplash.com/photo-1548013146-724ded68c90d?w=400&h=300&fit=crop';
  }
  if (countryLower.includes('africa')) {
    return 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&h=300&fit=crop';
  }
  if (countryLower.includes('america') || countryLower.includes('caribbean')) {
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
  }
  if (countryLower.includes('oceania') || countryLower.includes('pacific')) {
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
  }
  
  // Default beautiful travel image
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    upcomingCities: 0,
    totalBudget: { amount: 0, currency: 'USD' }
  })
  
  const { name: userName, avatar } = getCachedUser()

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch main dashboard data
        const dashboardResponse = await apiFetch('/dashboard')
        const data: DashboardData = dashboardResponse.data
        
        setDashboardData(data)
        
        // Convert backend trips to frontend format and limit to 3 most recent
        const convertedTrips = data.upcomingTrips.trips
          .map(convertBackendTrip)
          .slice(0, 3) // Only show 3 most recent trips
        setUpcomingTrips(convertedTrips)
        
        // Compute budget amount and currency dynamically
        const overview = (data.budget && data.budget.overview) ? data.budget.overview : { totalBudget: 0 }
        let budgetAmount = Number(overview.totalBudget) || 0
        if (budgetAmount === 0 && Array.isArray(data.upcomingTrips?.trips)) {
          budgetAmount = data.upcomingTrips.trips.reduce((sum, t) => sum + (t.budget?.amount || 0), 0)
        }
        let budgetCurrency = 'USD'
        const tripWithCurrency = (data.upcomingTrips?.trips || []).find(t => t.budget && t.budget.currency)
        if (tripWithCurrency && tripWithCurrency.budget && tripWithCurrency.budget.currency) {
          budgetCurrency = tripWithCurrency.budget.currency
        }
        
        // Set stats
        setStats({
          totalTrips: data.statistics.totalTrips,
          upcomingCities: data.upcomingTrips.count,
          totalBudget: {
            amount: budgetAmount,
            currency: budgetCurrency
          }
        })
        
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[16rem_1fr] lg:gap-8">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="px-4 pb-20 pt-6 sm:px-6 lg:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading your dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[16rem_1fr] lg:gap-8">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="px-4 pb-20 pt-6 sm:px-6 lg:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Something went wrong</h3>
                <p className="text-neutral-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[16rem_1fr] lg:gap-8">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="px-4 pb-20 pt-6 sm:px-6 lg:px-0">
          {/* Welcome Banner */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-block h-10 w-10 overflow-hidden rounded-full bg-neutral-200">
                  {avatar ? <img src={avatar} alt="Avatar" className="h-full w-full object-cover" /> : null}
                </span>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Welcome back, {userName || 'Traveler'}!</h1>
                  <p className="mt-1 text-sm text-neutral-600">Your next adventure is waiting.</p>
                </div>
              </div>
              <Link
                to="/cities"
                className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
              >
                Plan New Trip
              </Link>
            </div>
          </section>

          {/* Upcoming Trips */}
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">Upcoming Trips</h2>
              <Link to="/trips" className="text-xs text-neutral-700 hover:text-neutral-900">View all ({dashboardData?.upcomingTrips?.count || 0} trips)</Link>
            </div>
            {upcomingTrips.length > 0 ? (
              <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
                {upcomingTrips.map((trip) => (
                  <div key={trip.id} className="snap-start">
                    <TripCard trip={trip} onView={() => { }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No trips planned yet</h3>
                <p className="text-neutral-600 mb-4">Start planning your next adventure!</p>
                <Link
                  to="/cities"
                  className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
                >
                  Plan Your First Trip
                </Link>
              </div>
            )}
          </section>

          {/* Stats */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard 
              label="Total Trips Planned" 
              value={stats.totalTrips} 
              icon={<span>📌</span>} 
            />
            <StatsCard 
              label="Upcoming Trips" 
              value={dashboardData?.upcomingTrips?.count || 0} 
              icon={<span>🗺️</span>} 
            />
            <StatsCard 
              label="Total Budget Planned" 
              value={formatBudget(stats.totalBudget.amount, stats.totalBudget.currency)} 
              icon={<span>💰</span>} 
            />
          </section>

         
        </main>
      </div>
    </div>
  )
}


