import React from 'react';

export type Destination = {
  id: string
  name: string
  country: string
  photoUrl?: string
}

type DestinationCardProps = {
  destination: Destination
  onAdd?: (destination: Destination) => void
}

export default function DestinationCard({ destination, onAdd }: DestinationCardProps) {
  return (
    <article className="group inline-block w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-40 w-full bg-neutral-100">
        {destination.photoUrl ? (
          <img src={destination.photoUrl} alt={`${destination.name} photo`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-neutral-900">{destination.name}</h3>
            <p className="text-xs text-neutral-600">{destination.country}</p>
          </div>
          <button
            onClick={() => onAdd?.(destination)}
            className="inline-flex items-center justify-center rounded-md bg-teal-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            Add to Trip
          </button>
        </div>
      </div>
    </article>
  )
}


