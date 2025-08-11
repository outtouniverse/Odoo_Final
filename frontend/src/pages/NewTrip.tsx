import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useRouter } from "../utils/router.tsx"
import { apiFetch } from '../utils/api'
import { CalendarDays, MapPin, Wallet, Image as ImageIcon, Globe2 } from 'lucide-react'

export default function NewTrip() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budgetUsd, setBudgetUsd] = useState<number>(Number.NaN)
  const [coverPhoto, setCoverPhoto] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const [touched, setTouched] = useState({
    name: false,
    description: false,
    city: false,
    country: false,
    startDate: false,
    endDate: false,
    budget: false,
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.navigate('/login', { replace: true })
    }
  }, [])

  function getFieldErrors() {
    const errors: Record<string, string | null> = {
      name: null,
      description: null,
      city: null,
      country: null,
      startDate: null,
      endDate: null,
      budget: null,
    }
    const nameTrim = name.trim()
    const descTrim = description.trim()
    const cityTrim = city.trim()
    const countryTrim = country.trim()
    if (nameTrim.length < 3) errors.name = 'Trip name is required (min 3 characters).'
    if (descTrim.length < 10) errors.description = 'Description is required (min 10 characters).'
    if (!cityTrim) errors.city = 'City is required.'
    if (!countryTrim) errors.country = 'Country is required.'
    if (!startDate) errors.startDate = 'Start date is required.'
    if (!endDate) errors.endDate = 'End date is required.'
    // Date relationships
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const today = new Date(new Date().toDateString())
      if (!(start instanceof Date) || isNaN(start.getTime())) errors.startDate = 'Provide a valid start date.'
      if (!(end instanceof Date) || isNaN(end.getTime())) errors.endDate = 'Provide a valid end date.'
      if (!errors.startDate && !errors.endDate) {
        if (start >= end) errors.endDate = 'End date must be after start date.'
        if (start < today) errors.startDate = 'Start date must be in the future.'
      }
    }
    if (!Number.isFinite(budgetUsd) || budgetUsd <= 0) errors.budget = 'Budget must be a positive number.'
    return errors
  }

  function validate(): string | null {
    const errs = getFieldErrors()
    const first = Object.values(errs).find((v) => v)
    return first || null
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // mark all as touched on submit attempt
    setTouched({ name: true, description: true, city: true, country: true, startDate: true, endDate: true, budget: true })

    const validationError = validate()
    if (validationError) {
      setError(validationError)
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

      await apiFetch('/trips', { method: 'POST', body: JSON.stringify(payload) })
      setSuccess('Trip created successfully!')
      setTimeout(() => router.navigate('/trips'), 700)
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem('accessToken')
        router.navigate('/login', { replace: true })
        return
      }
      setError(err.message || 'Failed to create trip')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldErrors = getFieldErrors()

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
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              aria-invalid={!!fieldErrors.name}
              placeholder="e.g., Paris Adventure"
              className={`w-full rounded-md border-none px-3 py-2 text-sm ring-1 ring-inset placeholder:text-neutral-400 focus:bg-white focus:ring-2 ${touched.name && fieldErrors.name ? 'bg-red-50 text-red-900 ring-red-300 focus:ring-red-500' : 'bg-neutral-50 text-neutral-900 ring-neutral-200 focus:ring-blue-500'}`}
            />
            {touched.name && fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><Globe2 className="h-3.5 w-3.5" /> Location</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, city: true }))}
                  aria-invalid={!!fieldErrors.city}
                  placeholder="City"
                  className={`w-full rounded-md border-none px-3 py-2 text-sm ring-1 ring-inset placeholder:text-neutral-400 focus:bg-white focus:ring-2 ${touched.city && fieldErrors.city ? 'bg-red-50 text-red-900 ring-red-300 focus:ring-red-500' : 'bg-neutral-50 text-neutral-900 ring-neutral-200 focus:ring-blue-500'}`}
                />
                {touched.city && fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
              </div>
              <div>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, country: true }))}
                  aria-invalid={!!fieldErrors.country}
                  placeholder="Country"
                  className={`w-full rounded-md border-none px-3 py-2 text-sm ring-1 ring-inset placeholder:text-neutral-400 focus:bg-white focus:ring-2 ${touched.country && fieldErrors.country ? 'bg-red-50 text-red-900 ring-red-300 focus:ring-red-500' : 'bg-neutral-50 text-neutral-900 ring-neutral-200 focus:ring-blue-500'}`}
                />
                {touched.country && fieldErrors.country && <p className="mt-1 text-xs text-red-600">{fieldErrors.country}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-800">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, description: true }))}
              aria-invalid={!!fieldErrors.description}
              placeholder="What’s the plan?"
              className={`w-full rounded-md border-none px-3 py-2 text-sm ring-1 ring-inset placeholder:text-neutral-400 focus:bg-white focus:ring-2 ${touched.description && fieldErrors.description ? 'bg-red-50 text-red-900 ring-red-300 focus:ring-red-500' : 'bg-neutral-50 text-neutral-900 ring-neutral-200 focus:ring-blue-500'}`}
            />
            {touched.description && fieldErrors.description && <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><CalendarDays className="h-3.5 w-3.5" /> Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, startDate: true }))}
                aria-invalid={!!fieldErrors.startDate}
                className={`w-full rounded-md border-none px-3 py-2 text-sm ring-1 ring-inset focus:bg-white focus:ring-2 ${touched.startDate && fieldErrors.startDate ? 'bg-red-50 text-red-900 ring-red-300 focus:ring-red-500' : 'bg-neutral-50 text-neutral-900 ring-neutral-200 focus:ring-blue-500'}`}
              />
              {touched.startDate && fieldErrors.startDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.startDate}</p>}
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><CalendarDays className="h-3.5 w-3.5" /> End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, endDate: true }))}
                aria-invalid={!!fieldErrors.endDate}
                className={`w-full rounded-md border-none px-3 py-2 text-sm ring-1 ring-inset focus:bg-white focus:ring-2 ${touched.endDate && fieldErrors.endDate ? 'bg-red-50 text-red-900 ring-red-300 focus:ring-red-500' : 'bg-neutral-50 text-neutral-900 ring-neutral-200 focus:ring-blue-500'}`}
              />
              {touched.endDate && fieldErrors.endDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><Wallet className="h-3.5 w-3.5" /> Budget (USD)</label>
              <input
                type="number"
                value={Number.isNaN(budgetUsd) ? '' : budgetUsd}
                onChange={(e) => {
                  const val = e.target.value
                  setBudgetUsd(val === '' ? Number.NaN : parseFloat(val))
                }}
                onBlur={() => setTouched((t) => ({ ...t, budget: true }))}
                aria-invalid={!!fieldErrors.budget}
                className={`w-full rounded-md border-none px-3 py-2 text-sm ring-1 ring-inset focus:bg-white focus:ring-2 ${touched.budget && fieldErrors.budget ? 'bg-red-50 text-red-900 ring-red-300 focus:ring-red-500' : 'bg-neutral-50 text-neutral-900 ring-neutral-200 focus:ring-blue-500'}`}
              />
              {touched.budget && fieldErrors.budget && <p className="mt-1 text-xs text-red-600">{fieldErrors.budget}</p>}
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


