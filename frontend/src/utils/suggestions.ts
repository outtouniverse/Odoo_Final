export type Activity = {
  time: string
  name: string
  type: 'sightseeing' | 'food' | 'museum' | 'nature' | 'shopping' | 'other'
}

export type ItineraryDay = {
  title: string
  date: string // ISO date
  city: string
  activities: Activity[]
}

export type Flight = {
  route: string
  airline: string
  depart: string
  arrive: string
}

export type PricingItem = {
  label: string
  amountUsd: number
  note?: string
}

export type Suggestion = {
  id: string
  title: string
  location: string
  countryCode?: string
  imageUrl: string
  dateRange: { start: string; end: string }
  totalCostUsd: number
  badges: string[]
  details: {
    overview: string
    totals: { label: string; amountUsd: number }[]
    flights: Flight[]
    itineraryDays: ItineraryDay[]
    pricing: PricingItem[]
  }
}

export const suggestions: Suggestion[] = [
  {
    id: 'paris-1',
    title: 'Paris City Escape',
    location: 'Paris, France',
    countryCode: 'FR',
    imageUrl:
      'https://4kwallpapers.com/images/wallpapers/eiffel-tower-paris-france-cityscape-city-lights-sunset-3440x1440-4466.jpg',
    dateRange: { start: '2025-06-10', end: '2025-06-16' },
    totalCostUsd: 2400,
    badges: ['Art & Culture', 'Cafés', 'Walkable'],
    details: {
      overview:
        'Stroll along the Seine, explore world-class museums, and enjoy flaky croissants in cozy cafés.',
      totals: [
        { label: 'Lodging', amountUsd: 900 },
        { label: 'Flights', amountUsd: 700 },
        { label: 'Food', amountUsd: 400 },
        { label: 'Activities', amountUsd: 250 },
        { label: 'Transit', amountUsd: 120 },
      ],
      flights: [
        {
          route: 'JFK → CDG',
          airline: 'Air France',
          depart: '2025-06-10T18:30:00',
          arrive: '2025-06-11T07:25:00',
        },
        {
          route: 'CDG → JFK',
          airline: 'Delta',
          depart: '2025-06-16T11:20:00',
          arrive: '2025-06-16T14:05:00',
        },
      ],
      itineraryDays: [
        {
          title: 'Day 1 – Le Marais',
          date: '2025-06-11',
          city: 'Paris',
          activities: [
            { time: '10:00', name: 'Café breakfast', type: 'food' },
            { time: '12:00', name: 'Picasso Museum', type: 'museum' },
            { time: '16:00', name: 'Seine river walk', type: 'nature' },
          ],
        },
        {
          title: 'Day 2 – Louvre & Tuileries',
          date: '2025-06-12',
          city: 'Paris',
          activities: [
            { time: '09:30', name: 'Louvre Museum', type: 'museum' },
            { time: '14:00', name: 'Tuileries Garden', type: 'nature' },
            { time: '19:00', name: 'Left Bank bistro', type: 'food' },
          ],
        },
        {
          title: 'Day 3 – Montmartre',
          date: '2025-06-13',
          city: 'Paris',
          activities: [
            { time: '10:30', name: 'Sacré-Cœur', type: 'sightseeing' },
            { time: '14:00', name: 'Artists’ square', type: 'shopping' },
          ],
        },
        {
          title: 'Day 4 – Versailles',
          date: '2025-06-14',
          city: 'Versailles',
          activities: [
            { time: '11:00', name: 'Palace of Versailles', type: 'sightseeing' },
            { time: '15:30', name: 'Gardens of Versailles', type: 'nature' },
          ],
        },
        {
          title: 'Day 5 – Eiffel & Seine',
          date: '2025-06-15',
          city: 'Paris',
          activities: [
            { time: '10:00', name: 'Eiffel Tower', type: 'sightseeing' },
            { time: '18:00', name: 'Seine dinner cruise', type: 'food' },
          ],
        },
      ],
      pricing: [
        { label: 'Hotel – 5 nights', amountUsd: 900, note: 'Right Bank boutique' },
        { label: 'Roundtrip flight', amountUsd: 700 },
        { label: 'Museum pass', amountUsd: 120 },
        { label: 'Dining', amountUsd: 350 },
        { label: 'Metro card', amountUsd: 60 },
        { label: 'Versailles tickets', amountUsd: 80 },
      ],
    },
  },
]


