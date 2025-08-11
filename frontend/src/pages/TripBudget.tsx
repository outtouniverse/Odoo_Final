import React, { useMemo, useState } from 'react'
import { DollarSign, FileDown, FileText, AlertTriangle } from 'lucide-react'
import { useTrip } from '../utils/TripContext'
import { useRouter } from '../utils/router'

type Category = 'Transport' | 'Stay' | 'Activities' | 'Meals'

const BASE_PER_ACTIVITY_UNIT = 40 // cost unit multiplier

export default function TripBudget() {
  const { selectedActivities, totalCost, estDailySpend } = useTrip()
  const { navigate } = useRouter()
  const [notes, setNotes] = useState<Record<Category, string>>({ Transport: '', Stay: '', Activities: '', Meals: '' })

  // Build dynamic budget numbers based on selected activities
  const activityCost = useMemo(() => selectedActivities.reduce((sum, a) => sum + (a.cost ? a.cost * BASE_PER_ACTIVITY_UNIT : 50), 0), [selectedActivities])
  const MOCK_BREAKDOWN: Record<Category, number> = useMemo(() => ({
    Transport: Math.max(200, Math.round(activityCost * 0.3)),
    Stay: Math.max(350, Math.round(activityCost * 0.4)),
    Activities: activityCost,
    Meals: Math.max(180, Math.round(activityCost * 0.2)),
  }), [activityCost])
  const total = useMemo(() => Object.values(MOCK_BREAKDOWN).reduce((a, b) => a + b, 0), [MOCK_BREAKDOWN])
  const MOCK_DAILY = useMemo(() => Array.from({ length: Math.max(3, Math.ceil(selectedActivities.length / 3)) }, (_, i) => Math.round(estDailySpend * (0.9 + (i % 3) * 0.05))), [selectedActivities.length, estDailySpend])
  const avgPerDay = useMemo(() => Math.round(total / MOCK_DAILY.length), [total, MOCK_DAILY])
  const overBudget = false

  function percent(cat: Category) {
    return Math.round((MOCK_BREAKDOWN[cat] / total) * 100)
  }

  function exportCsv() {
    const rows = [['Category', 'Estimated Cost', '% of Total', 'Note'], ...Object.keys(MOCK_BREAKDOWN).map(k => {
      const c = k as Category
      return [c, String(MOCK_BREAKDOWN[c]), String(percent(c)), notes[c] || '']
    })]
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
        <div className="mb-4 text-xs text-neutral-600">Cities → Activities → <span className="font-semibold text-neutral-900">Budget</span> → Calendar → Public Itinerary</div>

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

        {overBudget && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="mr-2 inline h-4 w-4" /> You are over budget. <button className="underline">Suggested savings</button>
          </div>
        )}

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
                  return (Object.keys(MOCK_BREAKDOWN) as Category[]).map(cat => {
                    const value = MOCK_BREAKDOWN[cat]
                    const angle = (value / totalVal) * Math.PI * 2
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
              {(Object.keys(MOCK_BREAKDOWN) as Category[]).map(cat => (
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
              {(Object.keys(MOCK_BREAKDOWN) as Category[]).map(cat => (
                <tr key={cat} className="border-t border-neutral-200">
                  <td className="px-4 py-3">{cat}</td>
                  <td className="px-4 py-3">${MOCK_BREAKDOWN[cat].toLocaleString()}</td>
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


