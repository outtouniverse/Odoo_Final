import React, { useState } from 'react'
import Header from '../components/Header'
import { useRouter, RouterProvider, Routes, Route } from "../utils/router.tsx"
import { useTrip } from '../utils/TripContext'
import { CalendarDays, MapPin, Wallet } from 'lucide-react'

export default function NewTrip() {
  const { setTrip } = useTrip()
  const router = useRouter()
  const [destination, setDestination] = useState('Paris')
  const [startDate, setStartDate] = useState('2025-06-10')
  const [endDate, setEndDate] = useState('2025-06-16')
  const [budgetUsd, setBudgetUsd] = useState<number>(2400)
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!destination.trim() || !startDate || !endDate || Number.isNaN(budgetUsd)) {
      setError('Please complete all fields.')
      return
    }
    setTrip({ destination: destination.trim(), startDate, endDate, budgetUsd })
    router.navigate('/trip-plan')
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Create a new trip</h1>
          <p className="mt-1 text-sm text-neutral-600">Set your destination, dates, and budget.</p>
        </div>
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><MapPin className="h-3.5 w-3.5" /> Destination</label>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City" className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><CalendarDays className="h-3.5 w-3.5" /> Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><CalendarDays className="h-3.5 w-3.5" /> End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><Wallet className="h-3.5 w-3.5" /> Budget (USD)</label>
            <input type="number" value={budgetUsd} onChange={(e) => setBudgetUsd(parseFloat(e.target.value))} className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 focus:bg-white focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <div className="md:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="md:col-span-2">
            <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">Create Trip</button>
          </div>
        </form>
      </main>
    </div>
  )
}


