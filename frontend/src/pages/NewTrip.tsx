import React, { useState } from 'react'
import Header from '../components/Header'
import { useRouter } from "../utils/router.tsx"
import { apiFetch } from '../utils/api'
import { CalendarDays, MapPin, Wallet, Image as ImageIcon, Globe2 } from 'lucide-react'

export default function NewTrip() {
  const router = useRouter()
  const [name, setName] = useState('Paris Adventure')
  const [description, setDescription] = useState('A wonderful trip to explore the city and nearby regions.')
  const [city, setCity] = useState('Paris')
  const [country, setCountry] = useState('France')
  const [startDate, setStartDate] = useState('2025-07-10')
  const [endDate, setEndDate] = useState('2025-07-16')
  const [budgetUsd, setBudgetUsd] = useState<number>(2400)
  const [coverPhoto, setCoverPhoto] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim() || !city.trim() || !startDate || !endDate || Number.isNaN(budgetUsd)) {
      setError('Please complete all required fields.')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        name: name.trim(),
        description: description.trim(),
        startDate,
        endDate,
        coverPhoto: coverPhoto.trim() || undefined,
        isPublic,
        tags: [],
        budget: { amount: budgetUsd, currency: 'USD' },
        location: { city: city.trim(), country: country.trim() }
      }

      const res = await apiFetch('/trips', { method: 'POST', body: JSON.stringify(payload) })
      setSuccess('Trip created successfully!')
      // Redirect to dashboard or trip page after a short pause
      setTimeout(() => router.navigate('/dashboard'), 700)
    } catch (err: any) {
      setError(err.message || 'Failed to create trip')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Plan a new trip</h1>
          <p className="mt-1 text-sm text-neutral-600">Provide the details and we’ll save it to your trips.</p>
        </div>
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><MapPin className="h-3.5 w-3.5" /> Trip name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Paris Adventure" className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><Globe2 className="h-3.5 w-3.5" /> Location</label>
            <div className="grid grid-cols-2 gap-3">
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-blue-500" />
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-800">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What’s the plan?" className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-blue-500" />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><Wallet className="h-3.5 w-3.5" /> Budget (USD)</label>
              <input type="number" value={budgetUsd} onChange={(e) => setBudgetUsd(parseFloat(e.target.value))} className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><ImageIcon className="h-3.5 w-3.5" /> Cover photo URL (optional)</label>
              <input value={coverPhoto} onChange={(e) => setCoverPhoto(e.target.value)} placeholder="https://...jpg" className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-inset ring-neutral-200 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-neutral-700">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Make trip public
          </label>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{success}</div>}

          <div>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Saving…' : 'Create Trip'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}


