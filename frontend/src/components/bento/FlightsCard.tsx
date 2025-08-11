import React from 'react'
import type { Suggestion } from './suggestions'
import { Plane } from 'lucide-react'

function formatTime(dt: string) {
  const d = new Date(dt)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatDate(dt: string) {
  const d = new Date(dt)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function FlightsCard({ s }: { s: Suggestion }) {
  return (
    <article className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-900 via-purple-900 to-fuchsia-900/90 p-5 shadow-lg hover:shadow-xl transition-all duration-200 text-white relative overflow-hidden">
      <div className="absolute -top-8 -right-8 opacity-20 pointer-events-none">
        <Plane className="h-32 w-32 rotate-12" />
      </div>
      <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-2 mb-2">
        <Plane className="h-5 w-5 text-fuchsia-300 drop-shadow" />
        Flights
      </h4>
      <div className="space-y-4">
        {s.details.flights.map((f, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-fuchsia-300/20 bg-white/10 backdrop-blur-sm p-4 shadow-sm flex flex-col gap-1 hover:bg-fuchsia-900/20 transition group"
          >
            <div className="flex items-center gap-3 font-semibold text-fuchsia-100 text-[15px]">
              <span className="inline-flex items-center gap-1">
                <Plane className="h-4 w-4 text-fuchsia-300 group-hover:scale-110 transition" />
                <span className="tracking-tight">{f.route}</span>
              </span>
            </div>
            <div className="text-xs text-fuchsia-200/90 mt-1 font-medium tracking-wide">
              {f.airline}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
              <span className="bg-fuchsia-700/30 rounded px-2 py-0.5">
                <span className="font-semibold">{formatDate(f.depart)}</span>
                &nbsp;{formatTime(f.depart)}
              </span>
              <span className="mx-1 text-fuchsia-300 font-bold">→</span>
              <span className="bg-fuchsia-700/30 rounded px-2 py-0.5">
                <span className="font-semibold">{formatDate(f.arrive)}</span>
                &nbsp;{formatTime(f.arrive)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
