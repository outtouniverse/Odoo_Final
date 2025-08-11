import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Calendar, DollarSign, CheckCircle, Map, Cloud, Plane, Activity, Package, Receipt } from 'lucide-react'

// Mock suggestions data
const suggestions = [{
  destination: "Tokyo, Japan",
  duration: "7 days",
  dateRange: "Dec 15 – Dec 22",
  budget: 2500,
  activities: ["Visit Senso-ji Temple", "Explore Shibuya Crossing", "Try authentic ramen", "TeamLab Planets", "Mt. Fuji day trip", "Tsukiji Outer Market"],
  weather: "Sunny, 22°C",
  readiness: 85,
  expenses: {
    spent: 1234,
    remaining: 1266,
    categories: [
      { name: "Flights", amount: 800 },
      { name: "Hotels", amount: 1200 },
      { name: "Activities", amount: 500 }
    ],
    transactions: [
      { label: "Suica top-up", amount: 25, category: "Transport" },
      { label: "Sushi dinner", amount: 42, category: "Food" },
      { label: "TeamLab tickets", amount: 30, category: "Activities" }
    ]
  },
  flights: [
    { route: "NYC → NRT", date: "Dec 15", time: "8:30 AM", duration: "13h 45m", type: "Direct" },
    { route: "NRT → NYC", date: "Dec 22", time: "6:15 PM", duration: "14h 20m", type: "Direct" }
  ],
  destinations: ["Shinjuku", "Shibuya", "Asakusa", "Akihabara", "Ginza"],
  weatherDetail: { temp: 22, condition: "Sunny", high: 25, low: 18, forecast: [
    { day: "Mon", high: 24, low: 17 },
    { day: "Tue", high: 23, low: 16 },
    { day: "Wed", high: 22, low: 15 }
  ] },
  packingList: [
    { item: "Passport & Documents", packed: true },
    { item: "Camera & Chargers", packed: true },
    { item: "Comfortable Shoes", packed: true },
    { item: "Weather Gear", packed: false },
    { item: "Universal Adapter", packed: false },
    { item: "Portable Wi‑Fi", packed: false }
  ]
}]

// Mock components - replace these with your actual components
const TripIntroCard = ({ s }: { s: any }) => (
  <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 rounded-2xl">
    <h2 className="text-3xl font-bold mb-2">Trip to {s.destination}</h2>
    <div className="mb-4 flex flex-wrap items-center gap-3 text-blue-100">
      <span className="text-sm">{s.duration}</span>
      <span className="text-xs">•</span>
      <span className="inline-flex items-center gap-1 text-sm"><Calendar size={14} /> {s.dateRange}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {s.destinations.slice(0, 4).map((d: any, i: number) => (
        <span key={i} className="rounded-full bg-white/15 px-3 py-1 text-xs text-white ring-1 ring-white/20">{d}</span>
      ))}
    </div>
  </div>
)

const BudgetCard = ({ s }: { s: any }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <DollarSign className="text-green-500" /> Budget
    </h2>
    <p className="text-3xl font-bold text-green-600 mb-4">${s.budget.toLocaleString()}</p>
    <div className="space-y-2">
      {s.expenses.categories.map((c: any, i: number) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">{c.name}</span>
          <span className="font-medium">${c.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </div>
)

const ExpensesCard = ({ s }: { s: any }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <Receipt className="text-orange-500" /> Expenses
    </h2>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
        <p className="text-xs text-orange-700">Spent</p>
        <p className="text-2xl font-bold">${s.expenses.spent.toLocaleString()}</p>
      </div>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-xs text-emerald-700">Remaining</p>
        <p className="text-2xl font-bold">${s.expenses.remaining.toLocaleString()}</p>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      {s.expenses.categories.map((c: any, i: number) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">{c.name}</span>
          <span className="font-medium">${c.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold text-neutral-500">Recent transactions</p>
      <div className="space-y-2">
        {s.expenses.transactions.map((t: any, i: number) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 p-3 text-sm">
            <span className="text-neutral-700">{t.label}</span>
            <span className="font-medium">${t.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const ReadinessCard = ({ s }: { s: any }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <CheckCircle className="text-blue-500" /> Readiness
    </h2>
    <div className="flex items-end gap-3">
      <p className="text-5xl font-extrabold text-blue-600">{s.readiness}%</p>
      <span className="mb-2 text-sm text-neutral-500">Almost there</span>
    </div>
    <div className="mt-4 h-3 w-full rounded-full bg-neutral-100">
      <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-green-500" style={{ width: `${s.readiness}%` }} />
    </div>
  </div>
)

const DestinationsMap = ({ s }: { s: any }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <Map className="text-red-500" /> Destinations
    </h2>
    <div className="bg-gray-100 h-48 rounded-xl flex items-center justify-center mb-4">
      <MapPin className="text-red-500 w-10 h-10" />
    </div>
    <div className="flex flex-wrap gap-2">
      {s.destinations.map((d: any, i: number) => (
        <span key={i} className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 ring-1 ring-red-100">{d}</span>
      ))}
    </div>
  </div>
)

const WeatherCard = ({ s }: { s: any }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <Cloud className="text-sky-500" /> Weather
    </h2>
    <div className="text-center">
      <p className="text-5xl font-black mb-1">{s.weatherDetail.temp}°</p>
      <p className="text-sky-700 mb-4">{s.weatherDetail.condition}</p>
      <div className="flex justify-center gap-6 text-sm mb-4">
        <div className="text-center">
          <p className="text-sky-600">High</p>
          <p className="font-semibold">{s.weatherDetail.high}°</p>
        </div>
        <div className="text-center">
          <p className="text-sky-600">Low</p>
          <p className="font-semibold">{s.weatherDetail.low}°</p>
        </div>
      </div>
      <div className="mx-auto mt-2 flex max-w-xs items-center justify-center gap-2">
        {s.weatherDetail.forecast.map((d: any, i: number) => (
          <div key={i} className="flex w-full flex-col items-center rounded-lg border border-sky-100 bg-sky-50/50 p-2">
            <span className="text-xs text-sky-700">{d.day}</span>
            <span className="text-sm font-semibold">{d.high}° / {d.low}°</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const FlightsCard = ({ s }: { s: any }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <Plane className="text-indigo-500" /> Flights
    </h2>
    <div className="space-y-3">
      {s.flights.map((f: any, i: number) => (
        <div key={i} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{f.route}</p>
              <p className="text-indigo-700 text-xs">{f.date}, {f.time}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{f.duration}</p>
              <p className="text-indigo-700 text-xs">{f.type}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const DaysActivityCard = ({ s }: { s: any }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <Activity className="text-purple-500" /> Daily Activities
    </h2>
    <div className="space-y-2">
      {s.activities.slice(0, 4).map((activity: any, i: number) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-purple-100 bg-purple-50/50 p-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-200 text-xs font-bold">{i + 1}</div>
          <span className="text-sm">{activity}</span>
        </div>
      ))}
      {s.activities.length > 4 && (
        <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-3 text-center text-purple-700 text-sm">
          +{s.activities.length - 4} more activities
        </div>
      )}
    </div>
  </div>
)

const PackingListCard = ({ s }: { s: any }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <Package className="text-emerald-500" /> Packing List
    </h2>
    <div className="mb-3 flex items-end justify-between">
      <div className="text-sm text-neutral-600">
        {s.packingList.filter((p: any) => p.packed).length}/{s.packingList.length} items packed
      </div>
      <div className="h-2 w-40 rounded-full bg-neutral-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
          style={{ width: `${Math.round((s.packingList.filter((p: any) => p.packed).length / s.packingList.length) * 100)}%` }}
        />
      </div>
    </div>
    <div className="space-y-2">
      {s.packingList.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-sm">
          <div className={`flex h-5 w-5 items-center justify-center rounded ${p.packed ? 'bg-emerald-500 text-white' : 'bg-white ring-1 ring-emerald-200'}`}>
            {p.packed ? '✓' : ''}
          </div>
          <span className={`${p.packed ? 'text-emerald-700 line-through' : 'text-neutral-700'}`}>{p.item}</span>
        </div>
      ))}
    </div>
  </div>
)

const Header = () => (
  <header className="bg-white shadow-sm border-b">
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Travel Planner</h1>
    </div>
  </header>
)

export default function ItineraryBento() {
  const [activeTab, setActiveTab] = useState(0)
  const [labelIndex, setLabelIndex] = useState(-1)
  const s = suggestions[0]
  
  const tabs = [
    { name: 'Trip Overview', component: <TripIntroCard s={s} />, icon: MapPin, color: 'from-blue-500 to-purple-600' },
    { name: 'Budget', component: <BudgetCard s={s} />, icon: DollarSign, color: 'from-green-500 to-emerald-600' },
    { name: 'Expenses', component: <ExpensesCard s={s} />, icon: Receipt, color: 'from-orange-500 to-red-600' },
    { name: 'Readiness', component: <ReadinessCard s={s} />, icon: CheckCircle, color: 'from-blue-500 to-indigo-600' },
    { name: 'Destinations', component: <DestinationsMap s={s} />, icon: Map, color: 'from-red-500 to-pink-600' },
    { name: 'Weather', component: <WeatherCard s={s} />, icon: Cloud, color: 'from-sky-500 to-blue-600' },
    { name: 'Flights', component: <FlightsCard s={s} />, icon: Plane, color: 'from-indigo-500 to-purple-600' },
    { name: 'Activities', component: <DaysActivityCard s={s} />, icon: Activity, color: 'from-purple-500 to-pink-600' },
    { name: 'Packing List', component: <PackingListCard s={s} />, icon: Package, color: 'from-emerald-500 to-teal-600' }
  ]

  const nextTab = () => {
    setActiveTab((prev) => (prev + 1) % tabs.length)
  }

  const prevTab = () => {
    setActiveTab((prev) => (prev - 1 + tabs.length) % tabs.length)
  }

  const currentTab = tabs[activeTab]
  const IconComponent = currentTab.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 pb-8 pt-20 sm:pt-24 sm:px-6 lg:px-8">
        {/* Top Navigation Pills (moved from bottom) */}
        <div className="mb-6">
          <div className="mx-auto max-w-max sticky top-20 z-20">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-gray-200/70 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                {tabs.map((tab, index) => {
                  const TabIcon = tab.icon
                  const isActive = index === activeTab
                  return (
                    <div key={index} className="relative">
                      {labelIndex === index && (
                        <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-lg ring-1 ring-gray-200">
                          <span className={`mr-2 inline-block h-2 w-2 rounded-full bg-gradient-to-r ${tab.color}`} />
                          {tab.name}
                          <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-1 h-2 w-2 rotate-45 bg-white/95 ring-1 ring-gray-200" />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setActiveTab(index)
                          setLabelIndex(index)
                          setTimeout(() => setLabelIndex(-1), 1200)
                        }}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-110 ring-2 ring-offset-2 ring-offset-white`
                            : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                        }`}
                        title={tab.name}
                      >
                        <TabIcon size={18} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${currentTab.color} text-white shadow-md shadow-black/5 ring-1 ring-black/5`}>
                <IconComponent size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentTab.name}</h1>
                <p className="text-gray-500">{activeTab + 1} of {tabs.length}</p>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevTab}
                disabled={activeTab === 0}
                className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextTab}
                disabled={activeTab === tabs.length - 1}
                className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${currentTab.color} transition-all duration-500`}
              style={{ width: `${((activeTab + 1) / tabs.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Active Component */}
        <div className="mb-8 animate-fadeIn">
          {currentTab.component}
        </div>

        {/* Swipe Indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {tabs.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeTab
                  ? `w-8 bg-gradient-to-r ${currentTab.color}`
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}