import React, { createContext, useContext, useMemo, useState } from 'react'

export type TripDraft = {
  destination: string
  startDate: string // ISO yyyy-mm-dd
  endDate: string // ISO yyyy-mm-dd
  budgetUsd: number
}

type TripContextValue = {
  trip: TripDraft | null
  setTrip: (t: TripDraft | null) => void
}

const TripContext = createContext<TripContextValue | null>(null)

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used within TripProvider')
  return ctx
}

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trip, setTrip] = useState<TripDraft | null>(null)
  const value = useMemo(() => ({ trip, setTrip }), [trip])
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}


