import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { apiFetch } from '../utils/api'
import { Link, useRouter } from '../utils/router'

// Function to get relevant images for cities (same as Dashboard)
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

type SelectedCity = {
  id: string
  name: string
  country: string
  img?: string
  addedAt: string
  activities?: Activity[]
}

type Activity = {
  id: string
  name: string
  city: string
  category: string
  cost: string
  duration: string
  rating: number
  img: string
  description: string
  tags: string[]
  addedAt: string
}

type TripDoc = {
  _id: string
  name: string
  startDate?: string
  endDate?: string
  coverPhoto?: string
  location?: { city?: string; country?: string }
  status?: string
  selectedCities?: SelectedCity[]
  budget?: { amount: number; currency: string }
  description?: string
}

export default function Trips() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trips, setTrips] = useState<TripDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.navigate('/login', { replace: true })
      return
    }
    let mounted = true
    setLoading(true)
    setError(null)
    apiFetch('/trips')
      .then((res) => {
        if (!mounted) return
        const list = (res?.data as TripDoc[]) || []
        setTrips(Array.isArray(list) ? list : [])
      })
      .catch((e: any) => {
        if (e?.status === 401) {
          localStorage.removeItem('accessToken')
          router.navigate('/login', { replace: true })
          return
        }
        setError(e?.message || 'Failed to load trips')
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 lg:grid-cols-[16rem_1fr] lg:gap-8">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="px-4 pb-20 pt-6 sm:px-6 lg:px-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900">My Trips</h1>
              <p className="mt-1 text-sm text-neutral-600">All trips you have planned.</p>
            </div>
            <Link
              to="/cities"
              className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              Add Cities
            </Link>
          </div>

          {loading && <div className="text-sm text-neutral-600">Loading…</div>}
          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.length === 0 && (
                <div className="rounded-md border border-neutral-200 bg-white p-4 text-sm text-neutral-600">No trips found. <Link to="/cities" className="text-teal-600 hover:text-teal-700">Start by adding some cities!</Link></div>
              )}
              {trips.map((t) => (
                <article key={t._id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="h-36 w-full bg-neutral-100">
                    {(() => { 
                      // Get relevant cover image for the trip
                      let cover = t.coverPhoto;
                      
                      // If no cover photo, try to get image from first city
                      if (!cover && t.selectedCities && t.selectedCities.length > 0) {
                        const firstCity = t.selectedCities[0];
                        cover = getCityImage(firstCity.name, firstCity.country, firstCity.img);
                      }
                      
                      // If still no image, use a generic travel image
                      if (!cover) {
                        cover = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
                      }
                      
                      return (
                        <img src={cover} alt="Cover" className="h-full w-full object-cover" />
                      );
                    })()}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold">{t.name}</h3>
                    <p className="mt-1 text-xs text-neutral-600">
                      {t.location?.city || ''}{t.location?.city && t.location?.country ? ', ' : ''}{t.location?.country || ''}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                      {t.startDate ? new Date(t.startDate).toLocaleDateString() : ''}
                      {t.startDate && t.endDate ? ' — ' : ''}
                      {t.endDate ? new Date(t.endDate).toLocaleDateString() : ''}
                      {t.status ? ` · ${t.status}` : ''}
                    </p>
                    {t.selectedCities && t.selectedCities.length > 0 && (
                      <p className="mt-2 text-xs text-neutral-700">Destinations: <span className="font-medium">{t.selectedCities.length}</span></p>
                    )}
                    {/* Removed activities summary for cleaner trips view */}
                    {t.budget && (
                      <div className="mt-2 text-xs text-neutral-600">
                        Budget: {t.budget.currency} {t.budget.amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}


