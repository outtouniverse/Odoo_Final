import React, { useMemo, useState } from 'react'
import { Copy, ExternalLink, Share2, User, CalendarRange, BadgeCheck } from 'lucide-react'
import { useTrip } from '../utils/TripContext'

const PUBLIC_URL = typeof window !== 'undefined' ? window.location.origin + '/public-itinerary' : 'https://example.com/public-itinerary'

type PublicActivity = { time: string; name: string; img: string }
type PublicDay = { date: string; activities: PublicActivity[] }

const MOCK_PUBLIC = {
  title: 'Summer in Paris',
  hero: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop',
  creator: 'Alex Traveler',
  days: 6,
  dates: 'Jun 10 – Jun 15, 2025',
  cost: 2310,
  highlights: ['Museums', 'Cafés', 'Riverside Walks'],
  itinerary: [
    {
      date: 'Jun 10', activities: [
        { time: '09:00', name: 'City Walking Tour', img: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop' },
        { time: '12:30', name: 'Bistro Lunch', img: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1200&auto=format&fit=crop' },
      ]
    },
    {
      date: 'Jun 11', activities: [
        { time: '10:00', name: 'Louvre Museum', img: 'https://images.unsplash.com/photo-1552862750-746b8f570354?q=80&w=1200&auto=format&fit=crop' },
      ]
    },
  ] as PublicDay[],
}

export default function PublicItinerary() {
  const { selectedActivities } = useTrip()
  const [copied, setCopied] = useState(false)

  async function copyUrl() {
    await navigator.clipboard.writeText(PUBLIC_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const shareUrl = encodeURIComponent(PUBLIC_URL)
  const shareText = encodeURIComponent(`Check out this itinerary: ${MOCK_PUBLIC.title}`)

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Hero */}
      <div className="relative h-60 w-full overflow-hidden md:h-72">
        <img src={MOCK_PUBLIC.hero} alt={MOCK_PUBLIC.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
        <div className="absolute inset-0 flex items-end p-6">
          <div>
            <h1 className="text-2xl font-semibold text-white md:text-3xl">{MOCK_PUBLIC.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/90">
              <span className="inline-flex items-center gap-2"><User className="h-4 w-4" /> {MOCK_PUBLIC.creator}</span>
              <span className="inline-flex items-center gap-2"><CalendarRange className="h-4 w-4" /> {MOCK_PUBLIC.dates}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Public URL */}
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div className="text-sm text-neutral-700">Public URL</div>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <input value={PUBLIC_URL} readOnly className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm md:w-96" />
            <button onClick={copyUrl} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">
              <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">Cost: <span className="font-semibold">${MOCK_PUBLIC.cost.toLocaleString()}</span></div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">Days: <span className="font-semibold">{MOCK_PUBLIC.days}</span></div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">
            <div className="flex flex-wrap gap-2">
              {MOCK_PUBLIC.highlights.map(h => <span key={h} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] text-neutral-800"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />{h}</span>)}
            </div>
          </div>
        </div>

        {/* Timeline (uses selected activities if available) */}
        <div className="mt-6 space-y-6">
          {(selectedActivities.length ? groupByDay(selectedActivities) : MOCK_PUBLIC.itinerary).map((day: any) => (
            <section key={day.date} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold">{day.date}</div>
              <div className="divide-y divide-neutral-200">
                {day.activities.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <img src={a.img} alt="" className="h-14 w-20 rounded-md object-cover" />
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
          <button className="ml-auto inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700">Copy Trip</button>
        </div>
      </main>
    </div>
  )
}

function groupByDay(activities: { id: string; name: string; img: string }[]) {
  // Present a simple two-day grouping as we do not track dates here
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


