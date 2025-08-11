import React from 'react'
import type { Suggestion } from '../../utils/suggestions'


export default function DaysActivityCard({ s }: { s: Suggestion }) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-[#F4F1EA] p-4 shadow-sm transition hover:shadow-md">
      <h4 className="text-sm font-semibold text-neutral-900">Days & Activity</h4>
      <div className="mt-2 max-h-64 overflow-auto pr-1">
        <ul className="space-y-3">
          {s.details.itineraryDays.map((d) => (
            <li key={d.date} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-sm font-medium text-neutral-900">{d.title}</div>
              <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                {d.activities.map((a, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-neutral-600">{a.time}</span>
                    <span className="mx-2 h-px flex-1 bg-neutral-200" />
                    <span className="truncate">{a.name}</span>
                    <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-xs capitalize text-neutral-700">{a.type}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}


