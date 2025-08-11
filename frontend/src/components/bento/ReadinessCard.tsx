import React, { useMemo } from 'react'
import type { Suggestion } from './suggestions'

function daysUntil(startIso: string) {
  const now = new Date()
  const start = new Date(startIso)
  const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function ReadinessCard({ s }: { s: Suggestion }) {
  const days = useMemo(() => daysUntil(s.dateRange.start), [s.dateRange.start])
  const pct = Math.min(100, Math.max(0, 100 - (days / 90) * 100)) // arbitrary progress over a 90-day window
  const r = 32
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <article className="rounded-xl border border-neutral-200 bg-yellow-300/80 p-4 shadow-sm transition hover:shadow-md">
      <h4 className="text-sm font-semibold text-neutral-900">Readiness</h4>
      <div className="mt-2 flex items-center gap-4">
        <svg viewBox="0 0 80 80" className="h-20 w-20">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r={r} fill="none" stroke="#FDE68A" strokeWidth="10" />
          <circle cx="40" cy="40" r={r} fill="none" stroke="url(#grad)" strokeWidth="10" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
          <circle cx="40" cy="40" r="24" fill="white" />
          <text x="40" y="44" textAnchor="middle" className="fill-neutral-900" fontSize="16" fontWeight="600">{days}</text>
        </svg>
        <div>
          <div className="text-sm font-medium text-neutral-900">{days} days left</div>
          <div className="text-xs text-neutral-600">until your trip starts</div>
        </div>
      </div>
    </article>
  )
}


