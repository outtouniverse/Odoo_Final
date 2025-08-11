import React, { createContext, useContext, useMemo, useState } from 'react'
import type { Suggestion } from './suggestions'

export type TripDraft = {
  destination: string
  startDate: string // ISO yyyy-mm-dd
  endDate: string // ISO yyyy-mm-dd
  budgetUsd: number
}

export type SelectedCity = {
  id: string
  name: string
  country: string
  img?: string
  order: number
}

export type SelectedActivity = {
  id: string
  name: string
  city: string
  img: string
  duration?: string
  rating?: number
  cost?: number // relative 1-3
  order: number
}

type TripContextValue = {
  trip: TripDraft | null
  setTrip: (t: TripDraft | null) => void
  suggestion: Suggestion | null
  setSuggestion: (s: Suggestion | null) => void
  selectedCities: SelectedCity[]
  addCity: (c: Omit<SelectedCity, 'order'>) => void
  removeCity: (id: string) => void
  selectedActivities: SelectedActivity[]
  addActivity: (a: Omit<SelectedActivity, 'order'>) => void
  removeActivity: (id: string) => void
  clearFlow: () => void
  totalCost: number
  estDailySpend: number
}

const TripContext = createContext<TripContextValue | null>(null)

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used within TripProvider')
  return ctx
}

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trip, setTrip] = useState<TripDraft | null>(null)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [selectedCities, setSelectedCities] = useState<SelectedCity[]>([])
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([])

  function addCity(c: Omit<SelectedCity, 'order'>) {
    setSelectedCities((prev) => {
      if (prev.some((x) => x.id === c.id)) return prev
      const order = prev.length
      return [...prev, { ...c, order }]
    })
  }

  function removeCity(id: string) {
    setSelectedCities((prev) => prev.filter((c) => c.id !== id))
    // Also remove activities tied to that city
    setSelectedActivities((prev) => prev.filter((a) => a.city.toLowerCase() !== id.split('-')[0]))
  }

  function addActivity(a: Omit<SelectedActivity, 'order'>) {
    setSelectedActivities((prev) => {
      if (prev.some((x) => x.id === a.id)) return prev
      const order = prev.length
      return [...prev, { ...a, order }]
    })
  }

  function removeActivity(id: string) {
    setSelectedActivities((prev) => prev.filter((a) => a.id !== id))
  }

  function clearFlow() {
    setSelectedCities([])
    setSelectedActivities([])
  }

  // Derived totals (simple model: base $40 per cost unit)
  const totalCost = useMemo(() => selectedActivities.reduce((sum, a) => sum + (a.cost ? a.cost * 40 : 50), 0), [selectedActivities])
  const estDailySpend = useMemo(() => {
    const days = Math.max(1, Math.ceil(selectedActivities.length / 3))
    return Math.round(totalCost / days)
  }, [totalCost, selectedActivities.length])

  const value = useMemo(
    () => ({
      trip,
      setTrip,
      suggestion,
      setSuggestion,
      selectedCities,
      addCity,
      removeCity,
      selectedActivities,
      addActivity,
      removeActivity,
      clearFlow,
      totalCost,
      estDailySpend,
    }),
    [trip, suggestion, selectedCities, selectedActivities, totalCost, estDailySpend]
  )
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}


