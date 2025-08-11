import React, { useMemo } from 'react'
import type { Suggestion } from '../../utils/suggestions'

// Custom, aesthetic radial chart with animated segments and category breakdown
function BudgetDonutChart({ totals, totalBudget, breakdown }: { totals: number, totalBudget: number, breakdown: { label: string, amountUsd: number, color: string }[] }) {
  const r = 36
  const cx = 48
  const cy = 48
  const strokeWidth = 16
  const c = 2 * Math.PI * r

  // For each category, calculate its arc
  let acc = 0
  const arcs = breakdown.map((item, i) => {
    const pct = item.amountUsd / totalBudget
    const len = pct * c
    const arc = {
      ...item,
      strokeDasharray: `${len} ${c - len}`,
      strokeDashoffset: c - acc,
    }
    acc += len
    return arc
  })

  // Used percent for center
  const usedPct = Math.round((totals / totalBudget) * 100)
  const usedColor = usedPct < 60 ? '#10B981' : usedPct < 85 ? '#FACC15' : '#EF4444'

  return (
    <div className="relative flex items-center justify-center h-32 w-32">
      <svg viewBox="0 0 96 96" className="h-32 w-32" style={{ minHeight: '8rem', minWidth: '8rem' }}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
        />
        {/* Animated Segments */}
        {arcs.map((arc, i) => (
          <circle
            key={arc.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.strokeDasharray}
            strokeDashoffset={arc.strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(.4,2,.6,1), stroke 0.5s',
              filter: i === 0 ? 'drop-shadow(0 0 4px #10B98144)' : undefined,
            }}
          />
        ))}
        {/* Center white circle for donut effect */}
        <circle cx={cx} cy={cy} r={r - strokeWidth / 2} fill="white" />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-bold text-neutral-900">{usedPct}%</span>
        <span className="text-xs text-neutral-500">used</span>
      </div>
    </div>
  )
}

// Color palette for categories
const palette = [
  '#10B981', // green
  '#FACC15', // yellow
  '#3B82F6', // blue
  '#F472B6', // pink
  '#A78BFA', // purple
  '#F87171', // red
  '#FBBF24', // amber
  '#34D399', // teal
]

export default function BudgetCard({ s }: { s: Suggestion }) {
  // Use the breakdown from s.details.totals
  const breakdown = useMemo(() => {
    return s.details.totals.map((t, i) => ({
      ...t,
      color: palette[i % palette.length],
    }))
  }, [s])

  const totals = useMemo(() => s.details.totals.reduce((sum, t) => sum + t.amountUsd, 0), [s])

  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md h-48 flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-neutral-900">Budget</h4>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-neutral-500">
            Total ${s.totalCostUsd.toLocaleString()}
          </div>
        </div>
        <BudgetDonutChart totals={totals} totalBudget={s.totalCostUsd} breakdown={breakdown} />
      </div>

    </article>
  )
}
