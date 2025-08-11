import React, { useState } from 'react'
import { X } from 'lucide-react'

type SavedDestinationsProps = {
  initialItems?: Array<{ id: string; name: string }>
}

export default function SavedDestinations({ initialItems = [
  { id: '1', name: 'Lisbon' },
  { id: '2', name: 'Kyoto' },
  { id: '3', name: 'Cartagena' },
] }: SavedDestinationsProps) {
  const [items, setItems] = useState(initialItems)

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Saved Destinations</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-600">You haven’t saved any destinations yet.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
              <span className="truncate text-neutral-800">{d.name}</span>
              <button
                aria-label={`Remove ${d.name}`}
                onClick={() => remove(d.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-200/60"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}


