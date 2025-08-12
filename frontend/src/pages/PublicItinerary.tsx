import React, { useEffect, useMemo, useState } from 'react'
import { Copy, ExternalLink, Share2, CalendarRange, BadgeCheck } from 'lucide-react'
import { useTrip } from '../utils/TripContext'
import { apiFetch } from '../utils/api'

const PUBLIC_URL_BASE = typeof window !== 'undefined' ? window.location.origin : 'https://example.com'

type PublicActivity = { time: string; name: string; img: string }
type PublicDay = { date: string; activities: PublicActivity[] }

type BackendItineraryDay = { id: string; date: string; items: { id: string; activityId?: string; time: string; name: string }[] }

type BackendTrip = {
  _id: string
  name: string
  startDate: string
  endDate: string
  coverPhoto?: string
  isPublic: boolean
  selectedCities?: Array<{ id: string; name: string; country: string; img?: string }>
}

type CityLike = { id?: string; name: string; country?: string; img?: string }

const PLACEHOLDER_HERO = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop'
const PLACEHOLDER_IMG = 'https://placehold.co/160x96'

function slugify(input: string): string {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[,]/g, '')
    .replace(/\s+/g, '-')
}

export default function PublicItinerary() {
  const { selectedActivities, selectedCities, getLatestTrip } = useTrip()
  const [copied, setCopied] = useState(false)

  // Query params
  const [queryTripId] = useState<string | null>(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      return p.get('trip')
    } catch {
      return null
    }
  })
  const [queryCitySlug] = useState<string | null>(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      return p.get('city')
    } catch {
      return null
    }
  })

  // Display state (read-only)
  const [tripId, setTripId] = useState<string | null>(null)
  const [displayTitle, setDisplayTitle] = useState('')
  const [displayHero, setDisplayHero] = useState('')
  const [displayDateRange, setDisplayDateRange] = useState('')
  const [itineraryDays, setItineraryDays] = useState<PublicDay[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState<boolean | null>(null)
  const [savingVisibility, setSavingVisibility] = useState(false)
  const [visMsg, setVisMsg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function init() {
      setError(null)
      try {
        const targetTripId = queryTripId || await getLatestTrip()
        if (cancelled) return

        // Helper to choose active city
        function pickActiveCity(trip: BackendTrip | null): CityLike | null {
          const backendCities: CityLike[] = trip?.selectedCities || []

          // 1) If ?city provided, try to match by slug or id
          if (queryCitySlug) {
            const match = backendCities.find(c => slugify(c.name) === queryCitySlug || c.id === queryCitySlug)
              || selectedCities.find(c => slugify(c.name) === queryCitySlug || c.id === queryCitySlug)
            if (match) return { id: match.id, name: match.name, country: (match as any).country, img: match.img }
          }

          // 2) Try infer from selected activities (first activity city)
          if (selectedActivities.length) {
            const actCityRaw = selectedActivities[0].city || ''
            const actCity = actCityRaw.includes(',') ? actCityRaw.split(',')[0].trim() : actCityRaw.trim()
            const match = backendCities.find(c => c.name.toLowerCase() === actCity.toLowerCase())
              || selectedCities.find(c => c.name.toLowerCase() === actCity.toLowerCase())
            if (match) return { id: match.id, name: match.name, country: (match as any).country, img: match.img }
          }

          // 3) Fallback to first backend city then first selected city
          if (backendCities.length) return backendCities[0]
          if (selectedCities.length) return selectedCities[0]
          return null
        }

        if (targetTripId) {
          setTripId(targetTripId)
          // Fetch trip
          const resTrip = await apiFetch(`/trips/${targetTripId}`)
          const t: BackendTrip | undefined = resTrip?.data

          const activeCity = pickActiveCity(t || null)

          if (t) {
            setIsPublic(!!t.isPublic)
            // Title prioritizes active city
            const title = activeCity ? `${activeCity.name}${activeCity.country ? `, ${activeCity.country}` : ''}` : String(t.name || '').trim()
            setDisplayTitle(title || fallbackTitle())
            // Dates
            const start = t.startDate ? new Date(t.startDate) : null
            const end = t.endDate ? new Date(t.endDate) : null
            if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
              const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              setDisplayDateRange(`${fmt(start)} — ${fmt(end)}, ${end.getFullYear()}`)
            } else {
              setDisplayDateRange('')
            }
            // Cover image: prefer active city image, then trip cover, then fallback
            const hero = (activeCity?.img && activeCity.img.trim())
              || (t.coverPhoto && t.coverPhoto.trim())
              || selectedCities.find(c => c.name === activeCity?.name)?.img
              || PLACEHOLDER_HERO
            setDisplayHero(hero)
          } else {
            // Fallbacks from selection
            const activeCityFallback = pickActiveCity(null)
            applySelectionFallbacks(activeCityFallback)
          }

          // Fetch itinerary
          try {
            const resIt = await apiFetch(`/trips/${targetTripId}/itinerary`)
            const days: BackendItineraryDay[] = resIt?.data || []
            if (Array.isArray(days) && days.length > 0) {
              const mapped: PublicDay[] = days.map(d => ({
                date: formatDay(d.date),
                activities: (d.items || []).map(it => ({ time: it.time, name: it.name, img: PLACEHOLDER_IMG }))
              }))
              setItineraryDays(mapped)

              // Derive date range from calendar days
              const validDates = days
                .map(d => new Date(d.date))
                .filter(d => !Number.isNaN(d.getTime()))
                .sort((a, b) => a.getTime() - b.getTime())
              if (validDates.length > 0) {
                const first = validDates[0]
                const last = validDates[validDates.length - 1]
                const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const sameYear = first.getFullYear() === last.getFullYear()
                setDisplayDateRange(
                  sameYear
                    ? `${fmt(first)} — ${fmt(last)}, ${last.getFullYear()}`
                    : `${fmt(first)}, ${first.getFullYear()} — ${fmt(last)}, ${last.getFullYear()}`
                )
              }
            } else {
              // Fallback to grouped selected activities filtered by active city
              const activities = filterActivitiesByCity(selectedActivities, pickActiveCity(t || null)?.name || null)
              setItineraryDays(groupByDay(activities))
            }
          } catch {
            const activities = filterActivitiesByCity(selectedActivities, pickActiveCity(t || null)?.name || null)
            setItineraryDays(groupByDay(activities))
          }
        } else {
          // No trip id at all
          const activeCityFallback = pickActiveCity(null)
          applySelectionFallbacks(activeCityFallback)
          const activities = filterActivitiesByCity(selectedActivities, activeCityFallback?.name || null)
          setItineraryDays(groupByDay(activities))
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load itinerary')
      }
    }
    init()
    return () => { cancelled = true }
  }, [getLatestTrip, selectedActivities, selectedCities, queryTripId, queryCitySlug])

  function filterActivitiesByCity(activities: { city: string; id: string; name: string; img: string }[], cityName: string | null) {
    if (!cityName) return activities
    return activities.filter(a => {
      const raw = a.city || ''
      const clean = raw.includes(',') ? raw.split(',')[0].trim() : raw.trim()
      return clean.toLowerCase() === cityName.toLowerCase()
    })
  }

  function fallbackTitle() {
    return selectedCities.length ? `Trip to ${selectedCities.map(c => c.name).join(', ')}` : 'Your Trip'
  }

  function applySelectionFallbacks(activeCity: CityLike | null) {
    const title = activeCity ? `${activeCity.name}${activeCity.country ? `, ${activeCity.country}` : ''}` : fallbackTitle()
    setDisplayTitle(title)
    const now = new Date()
    const s = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const e = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    setDisplayDateRange(`${fmt(s)} — ${fmt(e)}, ${e.getFullYear()}`)
    setDisplayHero(activeCity?.img || selectedCities[0]?.img || PLACEHOLDER_HERO)
  }

  function formatDay(dateString: string) {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return dateString
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const publicUrlBase = useMemo(() => `${PUBLIC_URL_BASE}/public-itinerary`, [])
  const publicUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (tripId) params.set('trip', tripId)
    if (queryCitySlug) params.set('city', queryCitySlug)
    const q = params.toString()
    return q ? `${publicUrlBase}?${q}` : publicUrlBase
  }, [publicUrlBase, tripId, queryCitySlug])

  async function copyUrl() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const shareUrl = encodeURIComponent(publicUrl)
  const shareText = encodeURIComponent(`Check out this itinerary: ${displayTitle}`)

  async function saveVisibility(next: boolean) {
    try {
      setSavingVisibility(true)
      setVisMsg(null)
      if (!tripId) {
        setVisMsg('No trip found to update visibility')
        return
      }
      await apiFetch(`/trips/${tripId}`, { method: 'PUT', body: JSON.stringify({ isPublic: next }) })
      setIsPublic(next)
      setVisMsg(`Itinerary is now ${next ? 'public' : 'private'}`)
    } catch (e: any) {
      setVisMsg(e?.message || 'Failed to update visibility')
    } finally {
      setSavingVisibility(false)
      setTimeout(() => setVisMsg(null), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Hero */}
      <div className="relative h-60 w-full overflow-hidden md:h-72">
        <img src={displayHero || PLACEHOLDER_HERO} alt={displayTitle || 'Trip cover'} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
        <div className="absolute inset-0 flex items-end p-6">
          <div>
            <h1 className="text-2xl font-semibold text-white md:text-3xl">{displayTitle || 'Your Trip'}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/90">
              {displayDateRange ? (
                <span className="inline-flex items-center gap-2"><CalendarRange className="h-4 w-4" /> {displayDateRange}</span>
              ) : null}
            </div>
            {error ? <div className="mt-2 text-xs text-red-300">{error}</div> : null}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Visibility toggle */}
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-700">Visibility</div>
          <div className="flex items-center gap-2">
            <button onClick={() => saveVisibility(false)} disabled={savingVisibility} className={`rounded-md px-3 py-1.5 text-sm ${isPublic === false ? 'bg-neutral-900 text-white' : 'border border-neutral-300 hover:bg-neutral-50'}`}>Private</button>
            <button onClick={() => saveVisibility(true)} disabled={savingVisibility} className={`rounded-md px-3 py-1.5 text-sm ${isPublic ? 'bg-teal-600 text-white' : 'border border-neutral-300 hover:bg-neutral-50'}`}>Public</button>
          </div>
        </div>
        {visMsg && <div className="mb-3 text-xs text-emerald-700">{visMsg}</div>}

        {/* Public URL */}
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div className="text-sm text-neutral-700">Public URL</div>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <input value={publicUrl} readOnly className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm md:w-96" />
            <button onClick={copyUrl} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">
              <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
            </button>
            {tripId && (
              <a target="_blank" rel="noreferrer" href={`${PUBLIC_URL_BASE}/trips/${tripId}`} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">
                <ExternalLink className="h-4 w-4" /> Open JSON
              </a>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">Days: <span className="font-semibold">{Math.max(1, itineraryDays.length || 1)}</span></div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">Cities: <span className="font-semibold">{selectedCities.length || 1}</span></div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">
            <div className="flex flex-wrap gap-2">
              {selectedCities.slice(0, 4).map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] text-neutral-800">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />{c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 space-y-6">
          {(itineraryDays.length ? itineraryDays : groupByDay(selectedActivities)).map((day: any) => (
            <section key={day.date} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold">{day.date}</div>
              <div className="divide-y divide-neutral-200">
                {day.activities.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <img src={a.img || PLACEHOLDER_IMG} alt="" className="h-14 w-20 rounded-md object-cover" />
                    <div className="flex-1">
                      <div className="text-xs text-neutral-500">{a.time}</div>
                      <div className="text-sm font-medium">{a.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Share / Copy Trip */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <a target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"><Share2 className="h-4 w-4" /> Twitter</a>
          <a target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Facebook</a>
          <a target="_blank" rel="noreferrer" href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">WhatsApp</a>
        </div>
      </main>
    </div>
  )
}

function groupByDay(activities: { id: string; name: string; img: string }[]) {
  // Present a simple three-day grouping when no saved itinerary is available
  const days = ['Day 1', 'Day 2', 'Day 3']
  const buckets: Record<string, { time: string; name: string; img: string }[]> = {}
  days.forEach((d) => (buckets[d] = []))
  let i = 0
  for (const a of activities) {
    const day = days[i % days.length]
    const hour = 9 + (i % 3) * 3
    buckets[day].push({ time: `${String(hour).padStart(2, '0')}:00`, name: a.name, img: a.img })
    i++
  }
  return days.map((d) => ({ date: d, activities: buckets[d] }))
}


