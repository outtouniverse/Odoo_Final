import React from 'react'
import { MapPin, Sparkles } from 'lucide-react'
import type { Suggestion } from './suggestions'

export default function TripIntroCard({ s }: { s: Suggestion }) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 text-white shadow-sm hover:shadow-md transition-all">
      <div className="absolute inset-0">
        <img src={s.imageUrl} alt="Trip" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-neutral-900/50" />
      </div>
      <div className="relative p-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-neutral-800/70 px-2 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5" /> Your Trip
        </div>
        <h3 className="mt-2 text-xl font-semibold">Welcome To Your {s.title.split(' ')[0]} Adventure! 👋</h3>
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-white/90">
          <MapPin className="h-4 w-4" /> {s.location}
        </p>
        <p className="mt-3 max-w-md text-sm text-white/90 italic">{s.details.overview}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {s.badges.map((b) => (
            <span key={b} className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-white/95 ring-1 ring-inset ring-white/20">{b}</span>
          ))}
        </div>
      </div>
    </article>
  )
}


