import { useState } from 'react'
import { ShoppingBag, Trash2, CalendarDays, DollarSign, ChevronDown } from 'lucide-react'
import { useTrip } from '../utils/TripContext'
import { useRouter } from '../utils/router'

export default function MyTripCart() {
  const { selectedCities, selectedActivities, removeActivity, totalCost, estDailySpend } = useTrip()
  const { navigate } = useRouter()
  const [open, setOpen] = useState(false)

  const itemCount = selectedCities.length + selectedActivities.length

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* If not open, show only the icon with badge */}
      {!open && (
        <button
          className="relative flex items-center justify-center rounded-full bg-neutral-900 p-4 shadow-xl transition-transform duration-300 hover:scale-105 focus:outline-none"
          style={{ minWidth: 56, minHeight: 56 }}
          onClick={() => setOpen(true)}
          aria-label="Open My Trip"
        >
          <ShoppingBag className="h-6 w-6 text-white" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-teal-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
              {itemCount}
            </span>
          )}
        </button>
      )}

      {/* Cart panel */}
      <div
        className={`
          ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}
          transition-all duration-300 origin-bottom-right
          w-[320px] mt-2
        `}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
          <button
            className="flex w-full items-center justify-between bg-neutral-900 px-4 py-3 text-left text-white"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <ShoppingBag className="h-4 w-4" /> My Trip
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{itemCount}</span>
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="max-h-[60vh] overflow-auto p-3">
              {/* Cities */}
              {selectedCities.length > 0 && (
                <div className="mb-2">
                  <div className="px-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">Cities</div>
                  <ul className="mt-1 space-y-1">
                    {selectedCities.map((c) => (
                      <li key={c.id} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-sm">
                        <img src={c.img || 'https://placehold.co/60x40'} alt="" className="h-8 w-10 rounded object-cover" />
                        <div className="flex-1">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-[11px] text-neutral-500">{c.country}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Activities */}
              <div className="mt-2">
                <div className="px-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">Activities</div>
                {selectedActivities.length === 0 ? (
                  <div className="mt-1 rounded-lg border border-dashed border-neutral-300 p-3 text-center text-xs text-neutral-500">
                    Add activities to build your trip
                  </div>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {selectedActivities.map((a) => (
                      <li key={a.id} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2 text-sm">
                        <img src={a.img} alt="" className="h-8 w-10 rounded object-cover" />
                        <div className="flex-1">
                          <div className="line-clamp-1 font-medium">{a.name}</div>
                          <div className="text-[11px] text-neutral-500">{a.city}</div>
                        </div>
                        <button onClick={() => removeActivity(a.id)} className="rounded p-1 text-neutral-500 hover:bg-neutral-100" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Totals */}
              <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm">
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><DollarSign className="h-4 w-4" />Estimated Total</span><span className="font-semibold">${totalCost.toLocaleString()}</span></div>
                <div className="mt-1 flex items-center justify-between text-xs text-neutral-600"><span>Est. Daily Spend</span><span>${estDailySpend}</span></div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => navigate('/budget')} className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">Budget</button>
                <button onClick={() => navigate('/calendar')} className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"><CalendarDays className="h-4 w-4" /> Calendar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
