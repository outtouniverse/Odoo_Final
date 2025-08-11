import React from 'react'
import type { Suggestion } from './suggestions'
import { CloudSun } from 'lucide-react'

function mockWeather(city: string) {
  return { city, tempC: 22, type: 'Partly Cloudy' }
}

export default function WeatherCard({ s }: { s: Suggestion }) {
  const city = s.details.itineraryDays[0]?.city || s.location
  const w = mockWeather(city)
  return (
    <article className="rounded-xl border border-neutral-200 bg-indigo-100 p-4 shadow-sm transition hover:shadow-md">
      <h4 className="text-sm font-semibold text-neutral-900">{city.toUpperCase()}</h4>
      <div className="mt-2 flex items-center gap-3">
        <div className="rounded-lg bg-white p-3 text-indigo-600"><CloudSun className="h-6 w-6" /></div>
        <div>
          <div className="text-xs text-neutral-700">Temperature</div>
          <div className="text-xs text-neutral-600">{w.type}</div>
        </div>
        <div className="ml-auto text-3xl font-semibold text-neutral-900">{w.tempC}°C</div>
      </div>
    </article>
  )
}


