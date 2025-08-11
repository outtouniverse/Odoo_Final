import React, { useEffect, useState } from 'react'
import Header from '../components/Header.tsx'
import Sidebar from '../components/Sidebar.tsx'
import TripCard, { type Trip } from '../components/TripCard.tsx'
import StatsCard from '../components/StatsCard.tsx'
import DestinationCard from '../components/DestinationCard.tsx'
import type { Destination } from '../components/DestinationCard.tsx'
import { Link, useRouter } from '../utils/router.tsx'
import { apiFetch, getToken } from '../utils/api'
const dummyTrips: Trip[] = [
  { id: 't1', name: 'Tokyo • Kyoto • Osaka', dateRange: 'Apr 12 — Apr 24, 2025', destinations: 3, coverUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=1200&auto=format&fit=crop' },
  { id: 't2', name: 'Lisbon & Porto', dateRange: 'May 5 — May 12, 2025', destinations: 2, coverUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop' },
  { id: 't3', name: 'Seoul City Break', dateRange: 'Jun 1 — Jun 5, 2025', destinations: 1, coverUrl: 'https://images.unsplash.com/photo-1564495578408-03e0b5d4f9c4?q=80&w=1200&auto=format&fit=crop' },
]

const dummyDestinations: Destination[] = [
  { id: 'd1', name: 'Reykjavík', country: 'Iceland', photoUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop' },
  { id: 'd2', name: 'Hoi An', country: 'Vietnam', photoUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop' },
  { id: 'd3', name: 'Zermatt', country: 'Switzerland', photoUrl: 'https://images.unsplash.com/photo-1500043357865-c6b8827edfef?q=80&w=1200&auto=format&fit=crop' },
  { id: 'd4', name: 'Cartagena', country: 'Colombia', photoUrl: 'https://images.unsplash.com/photo-1558980394-0f33c4c6ec26?q=80&w=1200&auto=format&fit=crop' },
  { id: 'd5', name: 'Santa Barbara', country: 'USA', photoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop' },
  { id: 'd6', name: 'Hallstatt', country: 'Austria', photoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop' },
]

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [avatar, setAvatar] = useState('')
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // Guard: must have token
    const token = getToken()
    if (!token) {
      router.navigate('/login', { replace: true })
      return
    }

    apiFetch('/auth/me')
      .then((res) => {
        if (!mounted) return
        const name = res?.data?.user?.name
        const av = res?.data?.user?.avatar
        if (name) setUserName(name)
        if (av) setAvatar(av)
      })
      .catch(() => {
        // Fallback to /profile; if that fails too, redirect to login
        apiFetch('/profile').then((res) => {
          if (!mounted) return
          const name = res?.data?.name ?? res?.name
          const av = res?.data?.avatar ?? res?.avatar
          if (name) setUserName(name)
          if (av) setAvatar(av)
        }).catch(() => {
          router.navigate('/login', { replace: true })
        })
      })
    return () => { mounted = false }
  }, [])

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
                to="/new-trip"
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
              <button onClick={() => { }} className="text-xs text-neutral-700 hover:text-neutral-900">View all</button>
            </div>
            <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
              {dummyTrips.map((trip) => (
                <div key={trip.id} className="snap-start">
                  <TripCard trip={trip} onView={() => { }} />
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard label="Total Trips Planned" value={18} icon={<span>📌</span>} />
            <StatsCard label="Upcoming Cities" value={7} icon={<span>🗺️</span>} />
            <StatsCard label="Total Budget Planned" value="$12,450" icon={<span>💰</span>} />
          </section>

          {/* Recommended Destinations */}
          <section className="mt-10">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Recommended Destinations</h2>
            <div className="masonry columns-1 gap-4 md:columns-2 lg:columns-3">
              {dummyDestinations.map((d) => (
                <div key={d.id} className="masonry-item">
                  <DestinationCard destination={d} onAdd={() => { }} />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}


