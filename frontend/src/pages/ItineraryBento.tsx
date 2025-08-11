import React from 'react'
import { suggestions } from '../utils/suggestions'
import TripIntroCard from '../components/bento/TripIntroCard'
import BudgetCard from '../components/bento/BudgetCard'
import ExpensesCard from '../components/bento/ExpensesCard'
import ReadinessCard from '../components/bento/ReadinessCard'
import DestinationsMap from '../components/bento/DestinationsMap'
import WeatherCard from '../components/bento/WeatherCard'
import FlightsCard from '../components/bento/FlightsCard'
import DaysActivityCard from '../components/bento/DaysActivityCard'
import PackingListCard from '../components/bento/PackingListCard'
import Header from '../components/Header'

export default function ItineraryBento() {
  const s = suggestions[0]
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-xl font-semibold tracking-tight text-neutral-900">Itinerary</h1>
        <div className="grid auto-rows-max grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Row 1 */}
          <div className="lg:col-span-2"><TripIntroCard s={s} /></div>
          <BudgetCard s={s} />
          <div className="lg:col-start-4 lg:row-start-1 lg:row-span-3"><PackingListCard /></div>
          <ReadinessCard s={s} />

          {/* Row 2 */}
          <div className="lg:col-span-2 lg:row-span-2"><DestinationsMap s={s} /></div>
          <WeatherCard s={s} />
          <FlightsCard s={s} />

          {/* Row 3 */}
          <div className="lg:col-span-2"><DaysActivityCard s={s} /></div>
          <ExpensesCard s={s} />
        </div>
      </main>
    </div>
  )
}


