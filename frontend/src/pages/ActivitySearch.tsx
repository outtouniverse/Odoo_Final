import { useEffect, useMemo, useState } from 'react'
import { Search, X, Star, Plus, Check, Clock, DollarSign } from 'lucide-react'
import { useTrip } from '../utils/TripContext'

type Activity = {
  id: string
  name: string
  city: string
  category: 'Sightseeing' | 'Food' | 'Adventure' | 'Culture' | 'Nightlife'
  cost: 'Low' | 'Medium' | 'High'
  duration: '1–3 hrs' | 'Half-day' | 'Full-day'
  rating: number
  img: string
  description: string
  tags: string[]
}

const MOCK_ACTIVITIES: Activity[] = [
  { id: 'a1', name: 'Eiffel Tower Summit', city: 'Paris', category: 'Sightseeing', cost: 'High', duration: '1–3 hrs', rating: 4.8, img: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop', description: 'Climb to the top for panoramic views of Paris.', tags: ['view', 'landmark'] },
  { id: 'a2', name: 'Tapas Crawl', city: 'Barcelona', category: 'Food', cost: 'Medium', duration: 'Half-day', rating: 4.6, img: 'https://images.unsplash.com/photo-1546549039-6fc5632a08dc?q=80&w=1200&auto=format&fit=crop', description: 'Taste your way through historic tapas bars.', tags: ['food', 'walking'] },
  { id: 'a3', name: 'Sushi Workshop', city: 'Tokyo', category: 'Food', cost: 'Medium', duration: '1–3 hrs', rating: 4.7, img: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1200&auto=format&fit=crop', description: 'Hands-on class with master chef guidance.', tags: ['cooking', 'class'] },
  { id: 'a4', name: 'Seine River Cruise', city: 'Paris', category: 'Sightseeing', cost: 'Low', duration: '1–3 hrs', rating: 4.4, img: 'https://images.unsplash.com/photo-1552862750-746b8f570354?q=80&w=1200&auto=format&fit=crop', description: 'Relaxing boat tour past iconic landmarks.', tags: ['boat', 'relax'] },
  { id: 'a5', name: 'Flamenco Night', city: 'Barcelona', category: 'Culture', cost: 'Medium', duration: '1–3 hrs', rating: 4.5, img: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1200&auto=format&fit=crop', description: 'Authentic dance performance with live music.', tags: ['music', 'dance'] },
  { id: 'a6', name: 'Temple Hike', city: 'Tokyo', category: 'Adventure', cost: 'Low', duration: 'Half-day', rating: 4.3, img: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1200&auto=format&fit=crop', description: 'Scenic trails to hidden shrines.', tags: ['hiking', 'nature'] },
  { id: 'a7', name: 'Night Market Tour', city: 'Bangkok', category: 'Nightlife', cost: 'Low', duration: '1–3 hrs', rating: 4.2, img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop', description: 'Street eats and neon-lit shopping.', tags: ['food', 'market'] },
  { id: 'a8', name: 'Opera House Tour', city: 'Sydney', category: 'Culture', cost: 'Low', duration: '1–3 hrs', rating: 4.1, img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200&auto=format&fit=crop', description: 'Architecture and backstage stories.', tags: ['architecture'] },
]

const CATEGORIES: Activity['category'][] = ['Sightseeing', 'Food', 'Adventure', 'Culture', 'Nightlife']
const COSTS: Activity['cost'][] = ['Low', 'Medium', 'High']
const DURATIONS: Activity['duration'][] = ['1–3 hrs', 'Half-day', 'Full-day']

// Wikipedia image helpers
const wikiImageCache = new Map<string, string>()

async function fetchWikipediaImageForQuery(query: string): Promise<string> {
  try {
    if (wikiImageCache.has(query)) return wikiImageCache.get(query) || ''
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${encodeURIComponent(query)}&srlimit=1&origin=*`
    const searchRes = await fetch(searchUrl)
    if (!searchRes.ok) return ''
    const searchJson = await searchRes.json()
    const title = searchJson?.query?.search?.[0]?.title
    if (!title) return ''
    const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original|thumbnail&pithumbsize=1200&titles=${encodeURIComponent(title)}&origin=*`
    const imgRes = await fetch(imgUrl)
    if (!imgRes.ok) return ''
    const imgJson = await imgRes.json()
    const pages = imgJson?.query?.pages || {}
    const firstKey = Object.keys(pages)[0]
    const page = firstKey ? pages[firstKey] : null
    const url: string = page?.original?.source || page?.thumbnail?.source || ''
    if (url) wikiImageCache.set(query, url)
    return url || ''
  } catch {
    return ''
  }
}

function isGenericImage(url: string | undefined): boolean {
  if (!url) return true
  const lower = url.toLowerCase()
  return lower.includes('source.unsplash.com') || lower.includes('picsum.photos')
}

// Openverse image helpers (free, no key)
const openverseImageCache = new Map<string, string>()

async function fetchOpenverseImageForQuery(query: string): Promise<string> {
  try {
    if (openverseImageCache.has(query)) return openverseImageCache.get(query) || ''
    const url = `https://api.openverse.engineering/v1/images/?q=${encodeURIComponent(query)}&page_size=1&license_type=commercial&mature=false`
    const res = await fetch(url)
    if (!res.ok) return ''
    const json = await res.json()
    const first = Array.isArray(json?.results) ? json.results[0] : null
    const imageUrl: string = first?.url || first?.thumbnail || ''
    if (imageUrl) openverseImageCache.set(query, imageUrl)
    return imageUrl || ''
  } catch {
    return ''
  }
}

// Probe an image URL by attempting to load it in-memory
function probeImage(url: string, timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      let settled = false
      const done = (ok: boolean) => {
        if (settled) return
        settled = true
        resolve(ok)
      }
      const timer = setTimeout(() => done(false), timeoutMs)
      img.onload = () => {
        clearTimeout(timer)
        done(true)
      }
      img.onerror = () => {
        clearTimeout(timer)
        done(false)
      }
      img.src = url
    } catch {
      resolve(false)
    }
  })
}

async function pickBestImageForActivity(activity: Activity, city: string): Promise<string> {
  const baseFallback = `https://source.unsplash.com/1200x800/?${encodeURIComponent(city + ' ' + activity.category.toLowerCase())}`
  const ultimateFallback = `https://placehold.co/1200x800?text=${encodeURIComponent(activity.name)}`
  try {
    const q1 = `${activity.name} ${city}`
    const q2 = `${activity.category} in ${city}`
    // Gather candidates in order of preference
    const candidates: string[] = []
    const ov1 = await fetchOpenverseImageForQuery(q1); if (ov1) candidates.push(ov1)
    const ov2 = await fetchOpenverseImageForQuery(q2); if (ov2) candidates.push(ov2)
    const wk1 = await fetchWikipediaImageForQuery(q1); if (wk1) candidates.push(wk1)
    const wk2 = await fetchWikipediaImageForQuery(q2); if (wk2) candidates.push(wk2)
    candidates.push(baseFallback)
    candidates.push(ultimateFallback)

    for (const url of candidates) {
      // Skip if still generic and same as current
      if (!url) continue
      const ok = await probeImage(url, 6000)
      if (ok) return url
    }
    return ultimateFallback
  } catch {
    return baseFallback
  }
}

export default function ActivitySearch() {
  const { addActivity } = useTrip()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [category, setCategory] = useState<Activity['category'] | 'All'>('All')
  const [cost, setCost] = useState<Activity['cost'] | 'All'>('All')
  const [duration, setDuration] = useState<Activity['duration'] | 'All'>('All')
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [modalId, setModalId] = useState<string | null>(null)
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES)
  const [loadingAI, setLoadingAI] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300)
    return () => clearTimeout(t)
  }, [query])

  const filtered = useMemo(() => {
    let items = activities
    if (debounced) items = items.filter(a => `${a.name} ${a.city}`.toLowerCase().includes(debounced))
    if (category !== 'All') items = items.filter(a => a.category === category)
    if (cost !== 'All') items = items.filter(a => a.cost === cost)
    if (duration !== 'All') items = items.filter(a => a.duration === duration)
    return items
  }, [activities, debounced, category, cost, duration])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => { setPage(1) }, [debounced, category, cost, duration])
  const pageItems = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  function toggle(id: string) {
    setAdded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const modalItem = modalId ? activities.find(a => a.id === modalId) : null

  // Read city from URL and fetch activities via Gemini
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const city = params.get('city') || ''
    const country = params.get('country') || ''
    if (!city) return
    const key = "AIzaSyBYkv9KPhVmX4Ro6VHGEh_tmepFKBj7uWo"
    if (!key) return
    const prompt = `Return 12 JSON objects for engaging traveler activities in ${city}${country ? ', ' + country : ''}. Each object keys: id (short slug), name, city, category (Sightseeing|Food|Adventure|Culture|Nightlife), cost (Low|Medium|High), duration (1–3 hrs|Half-day|Full-day), rating (3.8-5.0), img (royalty-free URL), description (<=140 chars), tags (2-4 short tags). Only return a pure JSON array, no prose.`
    async function run() {
      setLoadingAI(true)
      try {
        const headers = new Headers()
        headers.set('Content-Type', 'application/json')
        headers.set('X-goog-api-key', key as string)
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        })
        if (!res.ok) throw new Error('Gemini request failed')
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        // Extract JSON array from response
        const jsonStart = text.indexOf('[')
        const jsonEnd = text.lastIndexOf(']')
        if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON array in response')
        const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as Activity[]
        // Basic sanitize
        const withDefaults = parsed.map((a, idx) => ({
          id: a.id || `ai-${idx}-${(a.name || 'activity').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: a.name?.slice(0, 60) || 'Activity',
          city: city,
          category: (['Sightseeing', 'Food', 'Adventure', 'Culture', 'Nightlife'] as const).includes(a.category as any) ? a.category : 'Sightseeing',
          cost: (['Low', 'Medium', 'High'] as const).includes(a.cost as any) ? a.cost : 'Medium',
          duration: (['1–3 hrs', 'Half-day', 'Full-day'] as const).includes(a.duration as any) ? a.duration : '1–3 hrs',
          rating: Math.min(5, Math.max(3.8, Number(a.rating) || 4.5)),
          img: a.img || `https://source.unsplash.com/1200x800/?${encodeURIComponent(city + ' activity')}`,
          description: a.description?.slice(0, 160) || 'Great local activity.',
          tags: Array.isArray(a.tags) && a.tags.length ? a.tags.slice(0, 4) : ['experience']
        }))
        // Improve images with robust probing & fallbacks
        setLoadingImages(true)
        const improved = await Promise.all(withDefaults.map(async (a) => {
          if (!isGenericImage(a.img)) {
            const ok = await probeImage(a.img)
            if (ok) return a
          }
          const picked = await pickBestImageForActivity(a, city)
          return { ...a, img: picked }
        }))
        setActivities(improved)
        setLoadingImages(false)
      } catch {
        // Fallback to mock filtered by city if provided
        const params = new URLSearchParams(window.location.search)
        const city = params.get('city') || ''
        const base = city ? MOCK_ACTIVITIES.filter(a => a.city.toLowerCase() === city.toLowerCase()) : MOCK_ACTIVITIES
        // Enhance fallback images as well
        setLoadingImages(true)
        const improved = await Promise.all(base.map(async (a) => {
          if (!isGenericImage(a.img)) {
            const ok = await probeImage(a.img)
            if (ok) return a
          }
          const picked = await pickBestImageForActivity(a, a.city)
          return { ...a, img: picked }
        }))
        setActivities(improved)
        setLoadingImages(false)
      } finally {
        setLoadingAI(false)
      }
    }
    run()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sticky filters */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search activities..." className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-8 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-600" />
              {query && <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100" aria-label="Clear"><X className="h-4 w-4" /></button>}
            </div>
            {(loadingAI || loadingImages) && (
              <div className="text-xs text-neutral-500">
                {loadingAI ? 'Generating suggested activities...' : 'Enhancing images...'}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">Category:</span>
                {(['All', ...CATEGORIES] as const).map(c => (
                  <button key={c} onClick={() => setCategory(c as any)} className={`rounded-full px-3 py-1 ${category === c ? 'bg-teal-600 text-white' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'}`}>{c}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">Cost:</span>
                {(['All', ...COSTS] as const).map(c => (
                  <button key={c} onClick={() => setCost(c as any)} className={`rounded-full px-3 py-1 ${cost === c ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'}`}>{c}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">Duration:</span>
                {(['All', ...DURATIONS] as const).map(d => (
                  <button key={d} onClick={() => setDuration(d as any)} className={`rounded-full px-3 py-1 ${duration === d ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'}`}>{d}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map(a => (
            <article key={a.id} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="relative h-36">
                <img src={a.img} alt={a.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs shadow">{a.city}</div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold">{a.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-600">{a.description}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-700">
                  <span className="inline-flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{a.cost}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.duration}</span>
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" />{a.rating}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.tags.map(t => <span key={t} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700">#{t}</span>)}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => setModalId(a.id)} className="rounded-lg border border-neutral-300 px-3 py-2 text-xs hover:bg-neutral-50">Quick View</button>
                  {added.has(a.id) ? (
                    <button onClick={() => toggle(a.id)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"><Check className="h-4 w-4" />Added</button>
                  ) : (
                    <button onClick={() => {
                      toggle(a.id)
                      addActivity({ id: a.id, name: a.name, city: a.city, img: a.img, duration: a.duration, rating: a.rating, cost: a.cost === 'High' ? 3 : a.cost === 'Medium' ? 2 : 1 })
                    }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium hover:bg-neutral-50"><Plus className="h-4 w-4" />Add</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-neutral-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-50">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-50">Next</button>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalItem && (
        <div aria-modal className="fixed inset-0 z-30 grid place-items-center bg-black/50 p-4" role="dialog" onClick={() => setModalId(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="h-48 w-full overflow-hidden">
              <img src={modalItem.img} alt={modalItem.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold">{modalItem.name}</h3>
                  <div className="mt-1 text-xs text-neutral-600">{modalItem.city} · {modalItem.category}</div>
                </div>
                <button aria-label="Close" onClick={() => setModalId(null)} className="rounded p-1 text-neutral-500 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
              </div>
              <p className="mt-2 text-sm text-neutral-700">{modalItem.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-neutral-700">
                <span className="inline-flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{modalItem.cost}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{modalItem.duration}</span>
                <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400" />{modalItem.rating}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


