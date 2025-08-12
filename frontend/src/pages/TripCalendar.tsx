import React, { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus, Wand2 } from 'lucide-react'
import { useTrip, type SelectedActivity } from '../utils/TripContext'
import { useRouter } from '../utils/router'

type Day = { id: string; date: string }
type Activity = { id: string; dayId: string; time: string; name: string }

const MOCK_DAYS: Day[] = [
  { id: 'd1', date: '2025-06-10' },
  { id: 'd2', date: '2025-06-11' },
  { id: 'd3', date: '2025-06-12' },
  { id: 'd4', date: '2025-06-13' },
  { id: 'd5', date: '2025-06-14' },
  { id: 'd6', date: '2025-06-15' },
]

const INITIAL_ACTIVITIES: Activity[] = [
  { id: 't1', dayId: 'd1', time: '09:00', name: 'City Walking Tour' },
  { id: 't2', dayId: 'd1', time: '13:00', name: 'Local Bistro Lunch' },
  { id: 't3', dayId: 'd2', time: '10:00', name: 'Museum Visit' },
  { id: 't4', dayId: 'd3', time: '08:00', name: 'Sunrise Viewpoint' },
]

export default function TripCalendar() {
  const { selectedActivities, getLatestTrip, getTripActivities, saveItinerary } = useTrip()
  const { navigate } = useRouter()
  const [view, setView] = useState<'calendar' | 'timeline'>('calendar')
  const [openDays, setOpenDays] = useState<Set<string>>(new Set([MOCK_DAYS[0].id]))
  const [items, setItems] = useState<Activity[]>(INITIAL_ACTIVITIES)
  const [persisted, setPersisted] = useState<SelectedActivity[]>([])
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // When arriving from budget step, seed activities into calendar (simple spread by day)
  // Pull latest activities from backend to seed calendar
  useEffect(() => {
    (async () => {
      try {
        const tripId = await getLatestTrip()
        if (!tripId) return
        const res = await getTripActivities(tripId)
        const list: any[] = res?.data || []
        const mapped: SelectedActivity[] = list.map((a: any, idx: number) => ({
          id: a.id,
          name: a.name,
          city: a.city || a.cityName || '',
          category: a.category,
          img: a.img || '',
          duration: a.duration,
          rating: a.rating,
          cost: a.cost,
          order: idx,
        }))
        setPersisted(mapped)
      } catch {
        // ignore
      }
    })()
  }, [])

  useEffect(() => {
    const source = persisted.length ? persisted : selectedActivities
    if (!source.length) return
    const seeded: Activity[] = []
    let dayIdx = 0
    let timeHour = 9
    for (const act of source.sort((a, b) => a.order - b.order)) {
      const day = MOCK_DAYS[dayIdx % MOCK_DAYS.length]
      const hh = String(timeHour).padStart(2, '0')
      seeded.push({ id: act.id, dayId: day.id, time: `${hh}:00`, name: act.name })
      timeHour += 3
      if (timeHour > 18) {
        timeHour = 9
        dayIdx++
      }
    }
    setItems(seeded)
  }, [persisted, selectedActivities])

  const byDay = useMemo(() => {
    const map: Record<string, Activity[]> = {}
    for (const d of MOCK_DAYS) map[d.id] = []
    for (const a of items) map[a.dayId].push(a)
    for (const d of MOCK_DAYS) map[d.id].sort((a, b) => a.time.localeCompare(b.time))
    return map
  }, [items])

  function addActivity(dayId: string) {
    const id = 't' + Math.random().toString(36).slice(2, 8)
    setItems(prev => [...prev, { id, dayId, time: '12:00', name: 'New Activity' }])
  }

  function autoSchedule() {
    // naive: spread any missing slots
    setItems(prev => prev.map(a => ({ ...a, time: a.time || '10:00' })))
  }

  function onDragStart(e: React.DragEvent<HTMLDivElement>, activityId: string) {
    e.dataTransfer.setData('text/plain', activityId)
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, dayId: string) {
    const id = e.dataTransfer.getData('text/plain')
    setItems(prev => prev.map(a => (a.id === id ? { ...a, dayId } : a)))
  }

  function rename(activityId: string, name: string) {
    setItems(prev => prev.map(a => (a.id === activityId ? { ...a, name } : a)))
  }

  function retime(activityId: string, time: string) {
    setItems(prev => prev.map(a => (a.id === activityId ? { ...a, time } : a)))
  }

  async function saveCalendar() {
    try {
      setSaving(true)
      setSaveMsg(null)
      const tripId = await getLatestTrip()
      if (!tripId) {
        setSaveMsg('No trip found to save calendar')
        return
      }
      // Convert items into itinerary days
      const daysMap: Record<string, { id: string; date: string; items: { id: string; activityId?: string; time: string; name: string }[] }> = {}
      for (const d of MOCK_DAYS) daysMap[d.id] = { id: d.id, date: d.date, items: [] }
      for (const it of items) {
        daysMap[it.dayId].items.push({ id: it.id, activityId: it.id, time: it.time, name: it.name })
      }
      const itinerary = Object.values(daysMap)
      await saveItinerary(tripId, itinerary)
      setSaveMsg('Calendar saved successfully')
    } catch (e: any) {
      setSaveMsg(e?.message || 'Failed to save calendar')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setView('calendar')} className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${view === 'calendar' ? 'bg-neutral-900 text-white' : 'border border-neutral-300 hover:bg-neutral-50'}`}><CalendarDays className="h-4 w-4" /> Calendar</button>
              <button onClick={() => setView('timeline')} className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${view === 'timeline' ? 'bg-neutral-900 text-white' : 'border border-neutral-300 hover:bg-neutral-50'}`}><CalendarDays className="h-4 w-4" /> Timeline</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => addActivity(MOCK_DAYS[0].id)} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"><Plus className="h-4 w-4" /> Add Activity</button>
              <button onClick={autoSchedule} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"><Wand2 className="h-4 w-4" /> Auto-Schedule</button>
              <button onClick={saveCalendar} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save Calendar'}</button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {saveMsg && <div className="mb-3 text-xs text-emerald-700">{saveMsg}</div>}
        {view === 'calendar' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_DAYS.map(d => (
              <div key={d.id} className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <button onClick={() => setOpenDays(s => { const n = new Set(s); n.has(d.id) ? n.delete(d.id) : n.add(d.id); return n })} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium">
                  <span>{d.date}</span>
                  <span className="text-neutral-500">{openDays.has(d.id) ? '−' : '+'}</span>
                </button>
                {openDays.has(d.id) && (
                  <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, d.id)} className="space-y-2 border-t border-neutral-200 p-3">
                    {byDay[d.id].length === 0 && <div className="text-xs text-neutral-500">No activities</div>}
                    {byDay[d.id].map(a => (
                      <div key={a.id} draggable onDragStart={(e) => onDragStart(e, a.id)} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
                        <input value={a.time} onChange={(e) => retime(a.id, e.target.value)} className="w-20 rounded border border-neutral-300 px-2 py-1 text-xs" />
                        <input value={a.name} onChange={(e) => rename(a.id, e.target.value)} className="flex-1 rounded border border-neutral-300 px-2 py-1 text-xs" />
                      </div>
                    ))}
                    <button onClick={() => addActivity(d.id)} className="w-full rounded-md border border-dashed border-neutral-300 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50">+ Add</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_DAYS.map(d => (
              <div key={d.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 text-sm font-medium">
                  <span>{d.date}</span>
                  <button onClick={() => addActivity(d.id)} className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50">Add</button>
                </div>
                <div className="p-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, d.id)}>
                  {byDay[d.id].length === 0 && <div className="text-xs text-neutral-500">No activities</div>}
                  <div className="space-y-2">
                    {byDay[d.id].map(a => (
                      <div key={a.id} draggable onDragStart={(e) => onDragStart(e, a.id)} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                        <input value={a.time} onChange={(e) => retime(a.id, e.target.value)} className="w-20 rounded border border-neutral-300 px-2 py-1 text-xs" />
                        <input value={a.name} onChange={(e) => rename(a.id, e.target.value)} className="flex-1 rounded border border-neutral-300 px-2 py-1 text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-end">
          <button onClick={() => navigate('/public-itinerary')} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">Publish Public Itinerary</button>
        </div>
      </main>
    </div>
  )
}


