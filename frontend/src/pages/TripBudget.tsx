import React, { useEffect, useMemo, useState } from 'react'
import { DollarSign, FileDown, FileText, AlertTriangle } from 'lucide-react'
import { useTrip, type SelectedActivity } from '../utils/TripContext'
import { useRouter } from '../utils/router'

type Category = 'Transport' | 'Stay' | 'Activities' | 'Meals'

const BASE_PER_ACTIVITY_UNIT = 40 // cost unit multiplier

export default function TripBudget() {
  const { selectedActivities, getLatestTrip, getTripActivities, saveBudget } = useTrip()
  const { navigate } = useRouter()
  const [notes, setNotes] = useState<Record<Category, string>>({ Transport: '', Stay: '', Activities: '', Meals: '' })
  const [fetchedActivities, setFetchedActivities] = useState<SelectedActivity[]>([])
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // Fetch activities from the latest trip in DB for accurate budgeting
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
        setFetchedActivities(mapped)
      } catch {
        // ignore and fall back to in-memory selectedActivities
      }
    })()
  }, [])

  // Build dynamic budget numbers based on selected activities
  const activityCost = useMemo(() => {
    const COST_VALUE: Record<string, number> = { Low: 1, Medium: 2, High: 3 }
    const source = fetchedActivities.length ? fetchedActivities : selectedActivities
    return source.reduce((sum, a) => sum + ((COST_VALUE[(a.cost as any) ?? 'Medium'] || 2) * BASE_PER_ACTIVITY_UNIT), 0)
  }, [fetchedActivities, selectedActivities])
  const breakdown = useMemo((): Record<Category, number> => ({
    Transport: Math.max(200, Math.round(activityCost * 0.3)),
    Stay: Math.max(350, Math.round(activityCost * 0.4)),
    Activities: activityCost,
    Meals: Math.max(180, Math.round(activityCost * 0.2)),
  }), [activityCost])
  const total = useMemo(() => Object.values(breakdown).reduce((a, b) => a + b, 0), [breakdown])
  const derivedDailySpend = useMemo(() => {
    const sourceLen = (fetchedActivities.length ? fetchedActivities : selectedActivities).length
    const days = Math.max(3, Math.ceil(sourceLen / 3))
    return Math.round((activityCost || 0) / Math.max(1, days))
  }, [activityCost, fetchedActivities, selectedActivities])
  const MOCK_DAILY = useMemo(() => Array.from({ length: Math.max(3, Math.ceil(((fetchedActivities.length ? fetchedActivities : selectedActivities).length) / 3)) }, (_, i) => Math.round(derivedDailySpend * (0.9 + (i % 3) * 0.05))), [fetchedActivities, selectedActivities, derivedDailySpend])
  const avgPerDay = useMemo(() => Math.round(total / MOCK_DAILY.length), [total, MOCK_DAILY])
  const overBudget = false

  function percent(cat: Category) {
    return total > 0 ? Math.round((breakdown[cat] / total) * 100) : 0
  }

  async function saveBudgetSummary() {
    try {
      setSaving(true)
      setSaveMsg(null)
      const tripId = await getLatestTrip()
      if (!tripId) {
        setSaveMsg('No trip found to save budget')
        return
      }
      await saveBudget(tripId, {
        transport: breakdown.Transport,
        stay: breakdown.Stay,
        activities: breakdown.Activities,
        meals: breakdown.Meals,
        total,
      })
      setSaveMsg('Budget saved successfully')
    } catch (e: any) {
      setSaveMsg(e?.message || 'Failed to save budget')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  function exportCsv() {
    const rows = [['Category', 'Estimated Cost', '% of Total', 'Note'], ...(Object.keys(breakdown) as Category[]).map((c) => [
      c,
      String(breakdown[c]),
      String(percent(c)),
      notes[c] || ''
    ])]
    const csv = rows.map(r => r.map(x => `"${String(x).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trip-budget.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Flow breadcrumb */}
        <div className="mb-2 text-xs text-neutral-600">Cities → Activities → <span className="font-semibold text-neutral-900">Budget</span> → Calendar → Public Itinerary</div>
        {saveMsg && <div className="mb-3 text-xs text-emerald-700">{saveMsg}</div>}

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-600">Total Est. Cost</div>
            <div className="mt-1 flex items-center gap-2 text-2xl font-semibold"><DollarSign className="h-5 w-5" /> {total.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-600">Avg. Cost / Day</div>
            <div className="mt-1 text-2xl font-semibold">${avgPerDay}</div>
          </div>
          <div className={`rounded-2xl border p-4 shadow-sm ${overBudget ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <div className="text-xs text-neutral-700">Budget Status</div>
            <div className="mt-1 text-2xl font-semibold">{overBudget ? 'Over Budget' : 'Within Budget'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button onClick={saveBudgetSummary} disabled={saving} className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save Budget'}</button>
          <button onClick={exportCsv} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"><FileDown className="mr-2 inline h-4 w-4" /> Export CSV</button>
          <button onClick={() => window.print()} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"><FileText className="mr-2 inline h-4 w-4" /> Export PDF</button>
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Pie */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Cost Distribution</h3>
            <div className="mt-4 grid place-items-center">
              <svg viewBox="0 0 120 120" className="h-56 w-56">
                <circle cx="60" cy="60" r="54" fill="#f3f4f6" />
                {(() => {
                  const colors: Record<Category, string> = { Transport: '#0ea5e9', Stay: '#10b981', Activities: '#f59e0b', Meals: '#ef4444' }
                  let start = 0
                  const totalVal = total
                  return (Object.keys(breakdown) as Category[]).map(cat => {
                    const value = breakdown[cat]
                    const angle = totalVal > 0 ? (value / totalVal) * Math.PI * 2 : 0
                    const x1 = 60 + 54 * Math.cos(start)
                    const y1 = 60 + 54 * Math.sin(start)
                    const x2 = 60 + 54 * Math.cos(start + angle)
                    const y2 = 60 + 54 * Math.sin(start + angle)
                    const largeArc = angle > Math.PI ? 1 : 0
                    const d = `M60,60 L${x1},${y1} A54,54 0 ${largeArc} 1 ${x2},${y2} Z`
                    start += angle
                    return <path key={cat} d={d} fill={colors[cat]} />
                  })
                })()}
                <circle cx="60" cy="60" r="32" fill="white" />
                <text x="60" y="63" textAnchor="middle" fontSize="10" fill="#111827">${total}</text>
              </svg>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {(Object.keys(breakdown) as Category[]).map(cat => (
                <div key={cat} className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1">
                  <span>{cat}</span><span>{percent(cat)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Daily Spend</h3>
            <div className="mt-4 h-56 w-full">
              <svg viewBox="0 0 400 160" className="h-full w-full">
                {MOCK_DAILY.map((v, i) => (
                  <rect key={i} x={30 + i * 55} y={150 - v / 3} width={35} height={v / 3} fill="#0f766e" />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                {['Category', 'Estimated Cost', '$ of total', 'Note'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(breakdown) as Category[]).map(cat => (
                <tr key={cat} className="border-t border-neutral-200">
                  <td className="px-4 py-3">{cat}</td>
                  <td className="px-4 py-3">${breakdown[cat].toLocaleString()}</td>
                  <td className="px-4 py-3">{percent(cat)}%</td>
                  <td className="px-4 py-3">
                    <input value={notes[cat] || ''} onChange={(e) => setNotes(n => ({ ...n, [cat]: e.target.value }))} placeholder="Add a note" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-4 py-3 text-sm">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50"><FileText className="h-4 w-4" /> Export PDF</button>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50"><FileDown className="h-4 w-4" /> Export CSV</button>
          </div>
        </div>

        {/* Continue flow */}
        <div className="mt-6 flex items-center justify-end">
          <button
            disabled={selectedActivities.length === 0}
            onClick={() => navigate('/calendar')}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Continue to Calendar
          </button>
        </div>
      </div>
    </div>
  )
}


