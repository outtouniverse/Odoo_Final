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
  category?: 'Sightseeing' | 'Food' | 'Adventure' | 'Culture' | 'Nightlife'
  img: string
  duration?: string
  rating?: number
  cost?: 'Low' | 'Medium' | 'High' // Changed from number to string to match backend
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
  currentTripId: string | null
  setCurrentTripId: (id: string | null) => void
  saveTripToDatabase: (tripData: {
    name: string
    description: string
    startDate: string
    endDate: string
    budget: { amount: number; currency: string }
  }) => Promise<any>
  saveCityToDatabase: (city: Omit<SelectedCity, 'order'>) => Promise<any>
  createQuickTrip: (cities: Omit<SelectedCity, 'order'>[]) => Promise<any>
  saveActivityToDatabase: (tripId: string, cityId: string, activity: Omit<SelectedActivity, 'order'>) => Promise<any>
  removeActivityFromDatabase: (tripId: string, cityId: string, activityId: string) => Promise<any>
  getTripActivities: (tripId: string) => Promise<any>
  getCityActivities: (tripId: string, cityId: string) => Promise<any>
  getItinerary: (tripId: string) => Promise<any>
  saveItinerary: (tripId: string, itinerary: { id: string; date: string; items: { id: string; activityId?: string; time: string; name: string }[] }[]) => Promise<any>
  getBudget: (tripId: string) => Promise<any>
  saveBudget: (tripId: string, summary: { transport: number; stay: number; activities: number; meals: number; total: number; currency?: string }) => Promise<any>
  createOrGetCurrentTrip: () => Promise<string>
  getLatestTrip: () => Promise<string | null>
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
  const [currentTripId, setCurrentTripId] = useState<string | null>(null)

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
    setCurrentTripId(null)
  }

  // Create or get current trip - this is the key function to fix the issue
  async function createOrGetCurrentTrip(): Promise<string> {
    // If we already have a trip ID, return it
    if (currentTripId) {
      return currentTripId
    }

    // If we have selected cities but no trip, create a quick trip
    if (selectedCities.length > 0) {
      try {
        const response = await createQuickTrip(selectedCities)
        const tripId = response.data._id
        setCurrentTripId(tripId)
        return tripId
      } catch (error) {
        console.error('Error creating quick trip:', error)
        throw new Error('Failed to create trip. Please try again.')
      }
    }

    // If no cities selected, throw error
    throw new Error('No cities selected. Please add cities to your trip first.')
  }

  // Get the latest trip for the current user
  async function getLatestTrip(): Promise<string | null> {
    try {
      const response = await apiFetch('/trips?limit=1&sort=-createdAt')
      if (response.data && response.data.length > 0) {
        const tripId = response.data[0]._id
        setCurrentTripId(tripId)
        return tripId
      }
      return null
    } catch (error) {
      console.error('Error fetching latest trip:', error)
      return null
    }
  }

  // Save city to database (add to existing trip)
  async function saveCityToDatabase(city: Omit<SelectedCity, 'order'>) {
    try {
      const response = await apiFetch('/trips/save-city', {
        method: 'POST',
        body: JSON.stringify({
          cityName: city.name,
          cityCountry: city.country,
          cityImg: city.img || ''
        })
      })

      return response
    } catch (error) {
      console.error('Error saving city to database:', error)
      throw error
    }
  }

  // Create a quick trip with selected cities
  async function createQuickTrip(cities: Omit<SelectedCity, 'order'>[]) {
    try {
      if (cities.length === 0) {
        throw new Error('No cities provided for trip creation')
      }

      // Ensure dates are properly formatted and valid
      const now = new Date()
      const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days from now

      const tripData = {
        name: `Trip to ${cities.map(c => c.name).join(', ')}`,
        description: `Exploring ${cities.length} amazing destination${cities.length > 1 ? 's' : ''}: ${cities.map(c => `${c.name}, ${c.country}`).join(' • ')}`,
        startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        budget: { amount: 1000, currency: 'USD' },
        location: {
          city: cities[0]?.name || '',
          country: cities[0]?.country || ''
        },
        coverPhoto: cities[0]?.img || '',
        tags: cities.map(c => `${c.name}, ${c.country}`),
        isPublic: false,
        selectedCities: cities.map(city => ({
          id: city.id,
          name: city.name,
          country: city.country,
          img: city.img || '',
          addedAt: new Date()
        }))
      }

      const response = await apiFetch('/trips/quick-add', {
        method: 'POST',
        body: JSON.stringify({ cities: cities.map(c => ({
          id: c.id,
          name: c.name,
          country: c.country,
          img: c.img || ''
        })) })
      })

      return response
    } catch (error: any) {
      console.error('Error creating quick trip:', error)
      // If it's an API error with details, use those
      if (error.errors && Array.isArray(error.errors)) {
        throw new Error(`Validation failed: ${error.errors.join(', ')}`)
      }
      // If it's a network error or other issue
      if (error.message) {
        throw new Error(error.message)
      }
      throw new Error('Failed to create trip. Please try again.')
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

      // Store the trip ID for future use
      if (response.data && response.data._id) {
        setCurrentTripId(response.data._id)
      }

      // Clear the flow after successful save
      clearFlow()
      
      return response
    } catch (error) {
      console.error('Error saving trip:', error)
      throw error
    }
  }

  // Save activity to database
  async function saveActivityToDatabase(tripId: string, cityId: string, activity: Omit<SelectedActivity, 'order'>) {
    try {
      // Extract city name and country from the activity
      const cityName = activity.city || 'Unknown City'
      let cityCountry = 'Unknown'
      
      console.log('🔍 Processing city data:', { 
        originalCity: activity.city, 
        cityName, 
        hasComma: cityName.includes(', '),
        cityNameType: typeof cityName,
        cityNameLength: cityName?.length
      });
      
      // Validate city name
      if (!cityName || cityName === 'Unknown City' || cityName.trim().length === 0) {
        console.error('❌ Invalid city name:', cityName);
        throw new Error('City name is required and cannot be empty');
      }
      
      // Try to extract country from city name (format: "City, Country")
      if (cityName.includes(', ')) {
        const parts = cityName.split(', ')
        cityCountry = parts[1] || 'Unknown'
        console.log('🔍 Extracted country from city name:', { parts, cityCountry });
      }
      
      // Ensure we have a valid city name (remove country part if present)
      const cleanCityName = cityName.includes(', ') ? cityName.split(', ')[0] : cityName
      
      console.log('🔍 Cleaned city data:', { 
        cleanCityName, 
        cityCountry, 
        cleanCityNameType: typeof cleanCityName,
        cleanCityNameLength: cleanCityName?.length
      });
      
      // Final validation of cleaned city name
      if (!cleanCityName || cleanCityName.trim().length === 0) {
        console.error('❌ Cleaned city name is empty after processing');
        throw new Error('City name cannot be empty after processing');
      }
      
      // Ensure cityCountry is never empty or undefined
      if (!cityCountry || cityCountry.trim().length === 0) {
        cityCountry = 'Unknown'
        console.log('🔍 Set default country:', cityCountry);
      }
      
      // Convert cost from string to number for costMap lookup (if needed)
      const costMap = { 'Low': 'Low', 'Medium': 'Medium', 'High': 'High' }
      const costString = costMap[activity.cost as keyof typeof costMap] || 'Medium'
      
      // Ensure we have all required fields
      const activityData = {
        id: activity.id || `activity-${Date.now()}`,
        name: activity.name || 'Unknown Activity',
        city: cleanCityName,
        category: activity.category || 'Sightseeing', // Use provided category or default
        cost: costString,
        duration: activity.duration || '1–3 hrs',
        rating: activity.rating || 4.0,
        img: activity.img || '',
        description: `Activity in ${cleanCityName}`,
        tags: ['activity', 'tourism']
      }
      
      const requestBody = {
        cityName: cleanCityName,
        cityCountry: cityCountry,
        activity: activityData
      };
      
      console.log('📤 Sending request to save-activity:', requestBody);
      
      const response = await apiFetch('/trips/save-activity', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })
      
      addActivity(activity) // Add to local state after successful save
      return response
    } catch (error) {
      console.error('Error saving activity to database:', error)
      throw error
    }
  }

  // Remove activity from database
  async function removeActivityFromDatabase(tripId: string, cityId: string, activityId: string) {
    try {
      const response = await apiFetch(`/trips/${tripId}/cities/${cityId}/activities/${activityId}`, {
        method: 'DELETE'
      })
      
      removeActivity(activityId) // Remove from local state after successful delete
      return response
    } catch (error) {
      console.error('Error removing activity from database:', error)
      throw error
    }
  }

  // Get all activities for a trip
  async function getTripActivities(tripId: string) {
    try {
      const response = await apiFetch(`/trips/${tripId}/activities`)
      return response
    } catch (error) {
      console.error('Error fetching trip activities:', error)
      throw error
    }
  }

  // Get activities for a specific city in a trip
  async function getCityActivities(tripId: string, cityId: string) {
    try {
      const response = await apiFetch(`/trips/${tripId}/cities/${cityId}/activities`)
      return response
    } catch (error) {
      console.error('Error fetching city activities:', error)
      throw error
    }
  }

  // Itinerary endpoints
  async function getItinerary(tripId: string) {
    return apiFetch(`/trips/${tripId}/itinerary`)
  }
  async function saveItinerary(tripId: string, itinerary: { id: string; date: string; items: { id: string; activityId?: string; time: string; name: string }[] }[]) {
    return apiFetch(`/trips/${tripId}/itinerary`, { method: 'PUT', body: JSON.stringify({ itinerary }) })
  }

  // Budget endpoints
  async function getBudget(tripId: string) {
    return apiFetch(`/trips/${tripId}/budget`)
  }
  async function saveBudget(tripId: string, summary: { transport: number; stay: number; activities: number; meals: number; total: number; currency?: string }) {
    return apiFetch(`/trips/${tripId}/budget`, { method: 'PUT', body: JSON.stringify({ summary }) })
  }

  // Derived totals (simple model: base $40 per cost unit)
  const totalCost = useMemo(() => selectedActivities.reduce((sum, a) => {
    const costValue = a.cost === 'High' ? 3 : a.cost === 'Medium' ? 2 : a.cost === 'Low' ? 1 : 1;
    return sum + (costValue * 40);
  }, 0), [selectedActivities])
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
      currentTripId,
      setCurrentTripId,
      saveTripToDatabase,
      saveCityToDatabase,
      createQuickTrip,
      saveActivityToDatabase,
      removeActivityFromDatabase,
      getTripActivities,
      getCityActivities,
      getItinerary,
      saveItinerary,
      getBudget,
      saveBudget,
      createOrGetCurrentTrip,
      getLatestTrip,
    }),
    [trip, suggestion, selectedCities, selectedActivities, totalCost, estDailySpend, currentTripId]
  )
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}


