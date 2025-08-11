import React, { createContext, useContext, useMemo, useState } from 'react'
import type { Suggestion } from './suggestions'
import { apiFetch } from './api'

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
  saveTripToDatabase: (tripData: {
    name: string
    description: string
    startDate: string
    endDate: string
    budget: { amount: number; currency: string }
  }) => Promise<any>
  saveCityToDatabase: (city: Omit<SelectedCity, 'order'>) => Promise<any>
  createQuickTrip: (cities: Omit<SelectedCity, 'order'>[]) => Promise<any>
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

  // Function to save city to database immediately
  async function saveCityToDatabase(city: Omit<SelectedCity, 'order'>) {
    try {
      // First, try to create a quick trip with this city
      const response = await apiFetch('/trips/quick-add', {
        method: 'POST',
        body: JSON.stringify({
          cities: [city]
        })
      })

      // Add to local state
      addCity(city)
      
      return response
    } catch (error) {
      console.error('Error saving city to database:', error)
      throw error
    }
  }

  // Function to create a quick trip with multiple cities
  async function createQuickTrip(cities: Omit<SelectedCity, 'order'>[]) {
    try {
      const response = await apiFetch('/trips/quick-add', {
        method: 'POST',
        body: JSON.stringify({
          cities: cities
        })
      })

      // Clear the flow after successful save
      clearFlow()
      
      return response
    } catch (error) {
      console.error('Error creating quick trip:', error)
      throw error
    }
  }

  // Function to save trip to database
  async function saveTripToDatabase(tripData: {
    name: string
    description: string
    startDate: string
    endDate: string
    budget: { amount: number; currency: string }
  }) {
    try {
      // Use the first selected city as the primary location
      const primaryCity = selectedCities[0]
      if (!primaryCity) {
        throw new Error('No cities selected for the trip')
      }

      const tripPayload = {
        ...tripData,
        location: {
          city: primaryCity.name,
          country: primaryCity.country
        },
        coverPhoto: primaryCity.img || '',
        tags: selectedCities.map(city => `${city.name}, ${city.country}`),
        isPublic: false
      }

      const response = await apiFetch('/trips', {
        method: 'POST',
        body: JSON.stringify(tripPayload)
      })

      // Clear the flow after successful save
      clearFlow()
      
      return response
    } catch (error) {
      console.error('Error saving trip:', error)
      throw error
    }
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
      saveTripToDatabase,
      saveCityToDatabase,
      createQuickTrip,
    }),
    [trip, suggestion, selectedCities, selectedActivities, totalCost, estDailySpend]
  )
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}


