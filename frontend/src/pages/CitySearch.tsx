import { useEffect, useMemo, useState } from 'react'
import { Search, X, SlidersHorizontal, Plus, Check, MapPin, Globe2 } from 'lucide-react'
import { useRouter } from '../utils/router'
import { useTrip } from '../utils/TripContext'

type City = {
  id: string
  name: string
  country: string
  continent: string
  costIndex: number // 0-100
  popularity: number // 0-100
  img: string
  description: string
  flag: string
}

const CONTINENTS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania']

// Seeded cities and Wikipedia helpers (free, no key)
const SEED_CITIES: Array<{ name: string; country: string; countryCode: string; continent: string }> = [
  // Europe
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', continent: 'Europe' },
  { name: 'Paris', country: 'France', countryCode: 'FR', continent: 'Europe' },
  { name: 'Berlin', country: 'Germany', countryCode: 'DE', continent: 'Europe' },
  { name: 'Madrid', country: 'Spain', countryCode: 'ES', continent: 'Europe' },
  { name: 'Rome', country: 'Italy', countryCode: 'IT', continent: 'Europe' },
  { name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', continent: 'Europe' },
  { name: 'Lisbon', country: 'Portugal', countryCode: 'PT', continent: 'Europe' },
  { name: 'Zurich', country: 'Switzerland', countryCode: 'CH', continent: 'Europe' },
  // Asia
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', continent: 'Asia' },
  { name: 'Seoul', country: 'South Korea', countryCode: 'KR', continent: 'Asia' },
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', continent: 'Asia' },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH', continent: 'Asia' },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', continent: 'Asia' },
  { name: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', continent: 'Asia' },
  { name: 'Mumbai', country: 'India', countryCode: 'IN', continent: 'Asia' },
  // North America
  { name: 'New York City', country: 'United States', countryCode: 'US', continent: 'North America' },
  { name: 'Los Angeles', country: 'United States', countryCode: 'US', continent: 'North America' },
  { name: 'Toronto', country: 'Canada', countryCode: 'CA', continent: 'North America' },
  { name: 'Mexico City', country: 'Mexico', countryCode: 'MX', continent: 'North America' },
  { name: 'Chicago', country: 'United States', countryCode: 'US', continent: 'North America' },
  { name: 'Vancouver', country: 'Canada', countryCode: 'CA', continent: 'North America' },
  // South America
  { name: 'São Paulo', country: 'Brazil', countryCode: 'BR', continent: 'South America' },
  { name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', continent: 'South America' },
  { name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', continent: 'South America' },
  { name: 'Santiago', country: 'Chile', countryCode: 'CL', continent: 'South America' },
  { name: 'Lima', country: 'Peru', countryCode: 'PE', continent: 'South America' },
  { name: 'Bogotá', country: 'Colombia', countryCode: 'CO', continent: 'South America' },
  // Africa
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', continent: 'Africa' },
  { name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', continent: 'Africa' },
  { name: 'Nairobi', country: 'Kenya', countryCode: 'KE', continent: 'Africa' },
  { name: 'Casablanca', country: 'Morocco', countryCode: 'MA', continent: 'Africa' },
  { name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', continent: 'Africa' },
  { name: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET', continent: 'Africa' },
  // Oceania
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', continent: 'Oceania' },
  { name: 'Melbourne', country: 'Australia', countryCode: 'AU', continent: 'Oceania' },
  { name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', continent: 'Oceania' },
  { name: 'Brisbane', country: 'Australia', countryCode: 'AU', continent: 'Oceania' },
  { name: 'Perth', country: 'Australia', countryCode: 'AU', continent: 'Oceania' },
  { name: 'Wellington', country: 'New Zealand', countryCode: 'NZ', continent: 'Oceania' }
]

async function fetchWikipediaSummary(title: string): Promise<any | null> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data?.type === 'disambiguation') return null
    return data
  } catch {
    return null
  }
}

async function fetchWikipediaCity(name: string, country: string): Promise<{ data: any | null; usedTitle: string | null }> {
  const candidates = [
    `${name}, ${country}`,
    `${name} (${country})`,
    `${name} (city)`,
    name
  ]
  for (const title of candidates) {
    const data = await fetchWikipediaSummary(title)
    if (data) return { data, usedTitle: title }
  }
  return { data: null, usedTitle: null }
}

async function fetchWikipediaOriginalImage(title: string): Promise<string> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}&origin=*`
    const res = await fetch(url)
    if (!res.ok) return ''
    const json = await res.json()
    const pages = json?.query?.pages || {}
    const firstKey = Object.keys(pages)[0]
    const original = firstKey ? pages[firstKey]?.original?.source : ''
    return original || ''
  } catch {
    return ''
  }
}

// Helper to get country flag emoji from country code
function getFlagEmoji(countryCode: string) {
  if (!countryCode) return ''
  return countryCode
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    )
}

export default function CitySearch() {
  const { navigate } = useRouter()
  const { addCity, removeCity } = useTrip()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [continent, setContinent] = useState('All')
  const [country, setCountry] = useState('All')
  const [costRange, setCostRange] = useState<[number, number]>([0, 100])
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [cities, setCities] = useState<City[]>([])
  const [extraCities, setExtraCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countries, setCountries] = useState<string[]>(['All'])

  const pageSize = 12

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300)
    return () => clearTimeout(t)
  }, [query])

  // Fetch city data using Wikipedia REST API (free, no key)
  useEffect(() => {
    async function fetchCities() {
      setLoading(true)
      setError(null)
      try {
        const results: City[] = []

        for (const seed of SEED_CITIES) {
          try {
            const { data: wiki, usedTitle } = await fetchWikipediaCity(seed.name, seed.country)
            let description = ''
            let img = ''
            let displayName = seed.name

            if (wiki) {
              if (wiki.extract) description = wiki.extract
              if (wiki.originalimage?.source) {
                img = wiki.originalimage.source
              } else if (wiki.thumbnail?.source) {
                img = wiki.thumbnail.source
              }
              if (wiki.title) displayName = wiki.title
            }

            if (!img && usedTitle) {
              img = await fetchWikipediaOriginalImage(usedTitle)
            }

            const id = `${displayName}-${seed.country}`.replace(/\s+/g, '-').toLowerCase()
            const costIndex = Math.floor(Math.random() * 61) + 30
            const popularity = Math.floor(Math.random() * 41) + 60
            const flag = getFlagEmoji(seed.countryCode)

            results.push({
              id,
              name: displayName,
              country: seed.country,
              continent: seed.continent,
              costIndex,
              popularity,
              img: img || '',
              description: description || 'No description available.',
              flag: flag || ''
            })
          } catch { }
        }

        setCities(results)

        // Build countries list
        const countrySet = new Set<string>()
        results.forEach(c => { if (c.country) countrySet.add(c.country) })
        setCountries(['All', ...Array.from(countrySet).sort()])
      } catch (err: any) {
        setError('Failed to load city data. ' + (err?.message || ''))
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  // Build countries list whenever base or extra changes
  useEffect(() => {
    const countrySet = new Set<string>()
      ;[...cities, ...extraCities].forEach(c => { if (c.country) countrySet.add(c.country) })
    setCountries(['All', ...Array.from(countrySet).sort()])
  }, [cities, extraCities])

  // Free, keyless city search beyond seeded using Open-Meteo Geocoding + RestCountries + Wikipedia
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!debounced) {
        setExtraCities([])
        return
      }
      try {
        // 1) Open-Meteo Geocoding search
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(debounced)}&count=6&language=en&format=json`)
        if (!geoRes.ok) throw new Error('Geocoding failed')
        const geo = await geoRes.json()
        const results = Array.isArray(geo?.results) ? geo.results : []

        // Deduplicate by name + country_code
        const seen = new Set<string>()
        const top = [] as Array<{ name: string; country: string; country_code: string }>
        for (const r of results) {
          if (!r?.name || !r?.country_code) continue
          const key = `${r.name.toLowerCase()}-${String(r.country_code).toUpperCase()}`
          if (seen.has(key)) continue
          seen.add(key)
          top.push({ name: r.name, country: r.country || '', country_code: String(r.country_code).toUpperCase() })
          if (top.length >= 5) break
        }

        // Cache for country -> continent via RestCountries
        const countryContinentCache = new Map<string, { name: string; continent: string }>()

        const built: City[] = []
        for (const item of top) {
          if (cancelled) return
          let continent = 'Unknown'
          let countryName = item.country
          try {
            if (item.country_code) {
              const cc = item.country_code
              if (!countryContinentCache.has(cc)) {
                const rcRes = await fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(cc)}?fields=name,continents,cca2`)
                if (rcRes.ok) {
                  const rcData = await rcRes.json()
                  const obj = Array.isArray(rcData) ? rcData[0] : rcData
                  const rcName = obj?.name?.common || countryName
                  const rcCont = Array.isArray(obj?.continents) && obj.continents[0] ? obj.continents[0] : 'Unknown'
                  countryContinentCache.set(cc, { name: rcName, continent: rcCont })
                }
              }
              const cached = countryContinentCache.get(cc)
              if (cached) {
                countryName = cached.name
                continent = cached.continent
              }
            }
          } catch { }


          // Wikipedia details
          let description = ''
          let img = ''
          let displayName = item.name
          try {
            const { data: wiki, usedTitle } = await fetchWikipediaCity(item.name, countryName || item.country)
            if (wiki) {
              if (wiki.extract) description = wiki.extract
              if (wiki.originalimage?.source) {
                img = wiki.originalimage.source
              } else if (wiki.thumbnail?.source) {
                img = wiki.thumbnail.source
              }
              if (wiki.title) displayName = wiki.title
            }
            if (!img && usedTitle) {
              img = await fetchWikipediaOriginalImage(usedTitle)
            }
          } catch { }

          const id = `${displayName}-${countryName || item.country}`.replace(/\s+/g, '-').toLowerCase()
          const costIndex = Math.floor(Math.random() * 61) + 30
          const popularity = Math.floor(Math.random() * 41) + 60
          const flag = getFlagEmoji(item.country_code)

          built.push({
            id,
            name: displayName,
            country: countryName || item.country,
            continent,
            costIndex,
            popularity,
            img: img || '',
            description: description || 'No description available.',
            flag: flag || ''
          })
        }

        if (!cancelled) setExtraCities(built)
      } catch {
        if (!cancelled) setExtraCities([])
      }
    }
    run()
    return () => { cancelled = true }
  }, [debounced])

  // Filtered cities
  const filtered = useMemo(() => {
    let items = [...cities, ...extraCities]
    if (debounced) items = items.filter(c => `${c.name} ${c.country}`.toLowerCase().includes(debounced))
    if (continent !== 'All') items = items.filter(c => c.continent === continent)
    if (country !== 'All') items = items.filter(c => c.country === country)
    items = items.filter(c => c.costIndex >= costRange[0] && c.costIndex <= costRange[1])
    return items.sort((a, b) => b.popularity - a.popularity)
  }, [cities, extraCities, debounced, continent, country, costRange])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => { setPage(1) }, [debounced, continent, country, costRange])
  const pageItems = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  function toggleAdd(id: string) {
    setAddedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        removeCity(id)
      } else {
        next.add(id)
        const c = [...cities, ...extraCities].find(x => x.id === id)
        if (c) {
          addCity({ id: c.id, name: c.name, country: c.country, img: c.img })
        }
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sticky controls */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                aria-label="Search cities"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cities..."
                className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-8 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              {query && (
                <button aria-label="Clear" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-neutral-500" />
                <select aria-label="Continent" value={continent} onChange={(e) => setContinent(e.target.value)} className="rounded-md border border-neutral-300 px-2 py-1 text-sm">
                  {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-500" />
                <select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-md border border-neutral-300 px-2 py-1 text-sm">
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <span>Cost</span>
                  <input aria-label="Min Cost" type="range" min={0} max={100} value={costRange[0]} onChange={(e) => setCostRange([Number(e.target.value), costRange[1]])} />
                  <input aria-label="Max Cost" type="range" min={0} max={100} value={costRange[1]} onChange={(e) => setCostRange([costRange[0], Number(e.target.value)])} />
                  <span className="ml-1">{costRange[0]}–{costRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {loading && (
          <div className="text-center text-neutral-500 py-10">Loading cities...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-10">{error}</div>
        )}
        {!loading && !error && (
          <>
            {/* Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageItems.map((c) => (
                <article key={c.id} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
                  <div className="relative h-36 w-full overflow-hidden">
                    <img src={c.img} alt={c.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs shadow">
                      <span className="mr-1">{c.flag}</span>
                      {c.country}
                    </div>

                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold">{c.name}</h3>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">{c.popularity}%</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-neutral-600">
                      <span>Cost Index: <span className="font-medium text-neutral-800">{c.costIndex}</span></span>
                      <span className="text-neutral-500">{c.continent}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {addedIds.has(c.id) ? (
                        <button aria-label="Added" onClick={() => toggleAdd(c.id)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                          <Check className="h-4 w-4" /> Added
                        </button>
                      ) : (
                        <button aria-label="Add to Trip" onClick={() => toggleAdd(c.id)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50">
                          <Plus className="h-4 w-4" /> Add to Trip
                        </button>
                      )}
                      <button aria-label="View Activities" onClick={() => { navigate(`/activities?city=${encodeURIComponent(c.name)}&country=${encodeURIComponent(c.country)}`) }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
                        View Activities
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between text-sm text-neutral-600">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-50">Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
