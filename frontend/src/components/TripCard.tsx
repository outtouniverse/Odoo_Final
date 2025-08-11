import React from 'react'

export type Trip = {
  id: string
  name: string
  dateRange: string
  destinations: number
  coverUrl?: string
}

type TripCardProps = {
  trip: Trip
  onView?: (trip: Trip) => void
}

export default function TripCard({ trip, onView }: TripCardProps) {
  return (
    <article className="group w-72 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-36 w-full bg-neutral-100">
        {trip.coverUrl ? (
          <img src={trip.coverUrl} alt="Trip cover" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">No photo</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"></div>
      </div>
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold text-neutral-900">{trip.name}</h3>
        <p className="mt-1 text-xs text-neutral-600">{trip.dateRange}</p>
        <p className="mt-1 text-xs text-neutral-600">{trip.destinations} destinations</p>
        <div className="mt-3">
          <button
            onClick={() => onView?.(trip)}
            className="inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            View Trip
          </button>
        </div>
      </div>
    </article>
  )
}


