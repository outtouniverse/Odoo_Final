import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { apiFetch } from '../utils/api'
import { Link, useRouter } from '../utils/router'

type TripDoc = {
  _id: string
  name: string
  startDate?: string
  endDate?: string
  coverPhoto?: string
  location?: { city?: string; country?: string }
  status?: string
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
              to="/new-trip"
              className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              Plan New Trip
            </Link>
          </div>

          {loading && <div className="text-sm text-neutral-600">Loading…</div>}
          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.length === 0 && (
                <div className="rounded-md border border-neutral-200 bg-white p-4 text-sm text-neutral-600">No trips found.</div>
              )}
              {trips.map((t) => (
                <article key={t._id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="h-36 w-full bg-neutral-100">
                    {t.coverPhoto ? (
                      <img src={t.coverPhoto} alt="Cover" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-400">No photo</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-sm font-semibold text-neutral-900">{t.name}</h3>
                    <p className="mt-1 text-xs text-neutral-600">
                      {t.location?.city || ''}{t.location?.city && t.location?.country ? ', ' : ''}{t.location?.country || ''}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                      {t.startDate ? new Date(t.startDate).toLocaleDateString() : ''}
                      {t.startDate && t.endDate ? ' — ' : ''}
                      {t.endDate ? new Date(t.endDate).toLocaleDateString() : ''}
                      {t.status ? ` · ${t.status}` : ''}
                    </p>
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


