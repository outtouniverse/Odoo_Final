import React, { useMemo } from 'react'
import Header from '../components/Header'
import { useTrip } from '../utils/TripContext'
import { useRouter, RouterProvider, Routes, Route } from "../utils/router.tsx"
import { CalendarDays, MapPin, CloudSun, Star } from 'lucide-react'

function daysUntil(startIso: string) {
    const now = new Date()
    const start = new Date(startIso)
    const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
}

export default function TripPlan() {
    const { trip } = useTrip()
    const router = useRouter()
    const days = useMemo(() => (trip ? daysUntil(trip.startDate) : 0), [trip])

    if (!trip) {
        router.navigate('/new-trip', { replace: true })
        return null
    }

    const attractions = ['Louvre Museum', 'Seine River Cruise', 'Montmartre']
    const weather = { type: 'Partly Cloudy', tempC: 22 }

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
            <Header />
            <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Trip Plan</h1>
                    <p className="mt-1 text-sm text-neutral-600">Review your plan before exploring the itinerary.</p>
                </div>

                <section className="grid gap-6 md:grid-cols-2">
                    <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-neutral-800"><MapPin className="h-4 w-4" /> {trip.destination}</div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-neutral-800"><CalendarDays className="h-4 w-4" /> {trip.startDate} → {trip.endDate}</div>
                        <div className="mt-2 text-sm text-neutral-800">Budget: ${trip.budgetUsd.toLocaleString()}</div>
                        <div className="mt-2 text-sm text-neutral-800">Days until trip: <span className="font-medium">{days}</span></div>
                    </article>

                    <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-900"><CloudSun className="h-4 w-4 text-blue-600" /> Weather</div>
                        <div className="text-sm text-neutral-800">{weather.type} — {weather.tempC}°C</div>
                        <div className="mt-4 text-sm font-semibold text-neutral-900">Attractions</div>
                        <ul className="mt-2 space-y-1 text-sm text-neutral-800">
                            {attractions.map((a) => (
                                <li key={a} className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> {a}</li>
                            ))}
                        </ul>
                    </article>
                </section>

                <div className="mt-6">
                    <button onClick={() => router.navigate('/itinerary')} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">View Itinerary</button>
                </div>
            </main>
        </div>
    )
}


