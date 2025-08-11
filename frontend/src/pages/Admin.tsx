import { useMemo, useState, useEffect } from 'react'
import { useRouter, Link } from '../utils/router'
import KPICard from '../components/admin/KPICard'
import { useAuth } from '../utils/auth'
import { apiFetch } from '../utils/api'

type SectionKey = 'overview' | 'users' | 'trips' | 'library'

const sections: { key: SectionKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'trips', label: 'Trips' },
    { key: 'library', label: 'Destinations' },
]

interface User {
    _id: string
    name: string
    email: string
    role: string
    isActive: boolean
    createdAt: string
}

interface Trip {
    _id: string
    name: string
    description: string
    startDate: string
    endDate: string
    status: string
    user: {
        name: string
        email: string
    }
    budget: {
        amount: number
        currency: string
    }
    location: {
        city: string
        country: string
    }
    createdAt: string
}

interface Destination {
    _id: string
    name: string
    country: string
    region?: string
    costIndex: number
    popularity: number
    image?: string
    description?: string
}

interface Analytics {
    totalUsers: number
    totalTrips: number
    popularDestinations: Array<{
        _id: string
        name: string
        popularity: number
    }>
    budgetStats?: {
        totalBudget: number
        averageBudget: number
        budgetByMonth: Array<{ month: string; amount: number }>
        budgetByStatus: Array<{ status: string; amount: number }>
    }
}

export default function Admin() {
    const { user, isAuthenticated, hasRole, logout } = useAuth()
    const { navigate, path } = useRouter()

    // State for dynamic data
    const [users, setUsers] = useState<User[]>([])
    const [trips, setTrips] = useState<Trip[]>([])
    const [destinations, setDestinations] = useState<Destination[]>([])
    const [analytics, setAnalytics] = useState<Analytics>({
        totalUsers: 0,
        totalTrips: 0,
        popularDestinations: []
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Search and filter states
    const [userSearch, setUserSearch] = useState('')
    const [tripSearch, setTripSearch] = useState('')
    const [tripStatusFilter, setTripStatusFilter] = useState('')
    const [tripBudgetFilter, setTripBudgetFilter] = useState('')
    const [destinationSearch, setDestinationSearch] = useState('')

    // Guard: require auth and admin role
    const allowed = isAuthenticated && hasRole('super_admin')

    // Redirect if not allowed (avoid setState in render)
    useEffect(() => {
        if (!allowed) {
            navigate('/login', { replace: true })
        }
    }, [allowed, navigate])

    if (!allowed) {
        return null
    }

    const visibleSections = useMemo(() => sections, [])

    const active: SectionKey = useMemo(() => {
        const hash = path.split('#')[1] || ''
        const candidate = visibleSections.find((s) => s.key === hash)
        return (candidate?.key || 'overview') as SectionKey
    }, [path, visibleSections])

    function setSection(key: SectionKey) {
        navigate(`/admin#${key}`)
    }

    // Fetch data based on active section
    useEffect(() => {
        if (!allowed) return

        const fetchData = async () => {
            setLoading(true)
            setError(null)
            
            try {
                switch (active) {
                    case 'overview':
                        await fetchOverview()
                        break
                    case 'users':
                        await fetchUsers()
                        break
                    case 'trips':
                        await fetchTrips()
                        break
                    case 'library':
                        await fetchDestinations()
                        break
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [active, allowed])

    const fetchUsers = async () => {
        try {
            const response = await apiFetch('/admin/users')
            if (response.success) {
                const normalized = (response.data as any[]).map((u: any) => ({
                    _id: u._id || u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    isActive: u.isActive,
                    createdAt: u.createdAt
                }))
                setUsers(normalized)
            }
        } catch (err: any) {
            console.error('Failed to fetch users:', err)
            setError('Failed to fetch users. Please ensure you are logged in as admin and backend is running.')
        }
    }

    const fetchTrips = async () => {
        try {
            const response = await apiFetch('/admin/trips')
            if (response.success) {
                setTrips(response.data)
            }
        } catch (err: any) {
            console.error('Failed to fetch trips:', err)
            setError('Failed to fetch trips. Please ensure backend is running.')
        }
    }

    const fetchDestinations = async () => {
        try {
            const response = await apiFetch('/admin/destinations')
            if (response.success) {
                setDestinations(response.data)
            }
        } catch (err: any) {
            console.error('Failed to fetch destinations:', err)
            setError('Failed to fetch destinations. Please ensure backend is running.')
        }
    }

    const fetchAnalytics = async () => {
        try {
            const [usersResponse, tripsResponse, popularResponse] = await Promise.all([
                apiFetch('/admin/analytics/users'),
                apiFetch('/admin/analytics/trips'),
                apiFetch('/admin/analytics/popular')
            ])

            setAnalytics({
                totalUsers: usersResponse.success ? usersResponse.data.totalUsers : 0,
                totalTrips: tripsResponse.success ? tripsResponse.data.totalTrips : 0,
                popularDestinations: popularResponse.success ? (popularResponse.data.destinations || []).map((d: any) => ({ _id: d._id, name: d.name, popularity: d.popularity || 0 })) : []
            })
        } catch (err: any) {
            console.error('Failed to fetch analytics:', err)
            setError('Failed to fetch analytics. Please ensure backend is running.')
        }
    }

    const fetchOverview = async () => {
        try {
            const res = await apiFetch('/admin/overview')
            if (res.success) {
                const { totals, popularDestinations, recent } = res.data
                setAnalytics({
                    totalUsers: totals?.users || 0,
                    totalTrips: totals?.trips || 0,
                    popularDestinations: (popularDestinations || []).map((d: any) => ({ _id: d._id, name: d.name, popularity: d.popularity || 0 }))
                })
                if (Array.isArray(recent?.users)) {
                    setUsers(recent.users.map((u: any) => ({
                        _id: u.id || u._id,
                        name: u.name,
                        email: u.email,
                        role: u.role,
                        isActive: u.isActive,
                        createdAt: u.createdAt
                    })))
                }
                if (Array.isArray(recent?.trips)) {
                    setTrips(recent.trips)
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch overview:', err)
            // fallback: load separate analytics
            await fetchAnalytics()
        }
    }

    // Calculate budget statistics
    const budgetStats = useMemo(() => {
        if (!trips.length) return null

        const totalBudget = trips.reduce((sum, trip) => sum + trip.budget.amount, 0)
        const averageBudget = totalBudget / trips.length

        // Group by month
        const budgetByMonth = trips.reduce((acc, trip) => {
            const month = new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            acc[month] = (acc[month] || 0) + trip.budget.amount
            return acc
        }, {} as Record<string, number>)

        // Group by status
        const budgetByStatus = trips.reduce((acc, trip) => {
            acc[trip.status] = (acc[trip.status] || 0) + trip.budget.amount
            return acc
        }, {} as Record<string, number>)

        return {
            totalBudget,
            averageBudget,
            budgetByMonth: Object.entries(budgetByMonth).map(([month, amount]) => ({ month, amount })),
            budgetByStatus: Object.entries(budgetByStatus).map(([status, amount]) => ({ status, amount }))
        }
    }, [trips])

    // Delete functions
    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
        }

        try {
            const response = await apiFetch(`/admin/users/${userId}`, {
                method: 'DELETE'
            })
            
            if (response.success) {
                setUsers(users.filter(u => u._id !== userId))
                setAnalytics(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
                setError(null)
            } else {
                setError('Failed to delete user')
            }
        } catch (err: any) {
            console.error('Failed to delete user:', err)
            setError('Failed to delete user. Please try again.')
        }
    }

    const deleteTrip = async (tripId: string) => {
        if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            return
        }

        try {
            const response = await apiFetch(`/admin/trips/${tripId}`, {
                method: 'DELETE'
            })
            
            if (response.success) {
                setTrips(trips.filter(t => t._id !== tripId))
                setAnalytics(prev => ({ ...prev, totalTrips: prev.totalTrips - 1 }))
                setError(null)
            } else {
                setError('Failed to delete trip')
            }
        } catch (err: any) {
            console.error('Failed to delete trip:', err)
            setError('Failed to delete trip. Please try again.')
        }
    }

    const deleteDestination = async (destinationId: string) => {
        if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
            return
        }

        try {
            const response = await apiFetch(`/admin/destinations/${destinationId}`, {
                method: 'DELETE'
            })
            
            if (response.success) {
                setDestinations(destinations.filter(d => d._id !== destinationId))
                setError(null)
            } else {
                setError('Failed to delete destination')
            }
        } catch (err: any) {
            console.error('Failed to delete destination:', err)
            setError('Failed to delete destination. Please try again.')
        }
    }

    // Toggle user status
    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await apiFetch(`/admin/users/${userId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !currentStatus })
            })
            
            if (response.success) {
                setUsers(users.map(u => 
                    u._id === userId ? { ...u, isActive: !currentStatus } : u
                ))
                setError(null)
            } else {
                setError('Failed to update user status')
            }
        } catch (err: any) {
            console.error('Failed to update user status:', err)
            setError('Failed to update user status. Please try again.')
        }
    }

    // Filtered data
    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearch.toLowerCase())
        )
    }, [users, userSearch])

    const filteredTrips = useMemo(() => {
        return trips.filter(trip => {
            const matchesSearch = trip.name.toLowerCase().includes(tripSearch.toLowerCase()) ||
                trip.location.city.toLowerCase().includes(tripSearch.toLowerCase()) ||
                trip.location.country.toLowerCase().includes(tripSearch.toLowerCase())
            
            const matchesStatus = !tripStatusFilter || trip.status === tripStatusFilter
            
            const matchesBudget = !tripBudgetFilter || trip.budget.amount <= parseInt(tripBudgetFilter)
            
            return matchesSearch && matchesStatus && matchesBudget
        })
    }, [trips, tripSearch, tripStatusFilter, tripBudgetFilter])

    const filteredDestinations = useMemo(() => {
        return destinations.filter(dest => 
            dest.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
            dest.country.toLowerCase().includes(destinationSearch.toLowerCase())
        )
    }, [destinations, destinationSearch])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-neutral-900">
            <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link to="/" className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            🌍 GlobeTrotter Admin
                        </Link>
                        <nav className="hidden items-center gap-6 text-sm text-neutral-700 md:flex" aria-label="Admin">
                            {visibleSections.map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setSection(s.key)}
                                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                                        active === s.key 
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                                    }`}
                                    aria-current={active === s.key ? 'page' : undefined}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </nav>
                        <div className="flex items-center gap-3">
                            <span className="hidden text-sm text-neutral-700 md:inline font-medium">
                                👤 {user?.name} · Super Admin
                            </span>
                            <button 
                                onClick={logout} 
                                className="inline-flex items-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors duration-200"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⚠️</span>
                            {error}
                        </div>
                    </div>
                )}
                
                {loading && (
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-6 py-4 text-sm text-blue-700 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Loading data...
                        </div>
                    </div>
                )}

                {active === 'overview' && <OverviewSection analytics={analytics} budgetStats={budgetStats} />}
                {active === 'users' && (
                    <UsersSection 
                        users={filteredUsers} 
                        search={userSearch}
                        onSearchChange={setUserSearch}
                        onRefresh={fetchUsers} 
                        onDelete={deleteUser}
                        onToggleStatus={toggleUserStatus}
                    />
                )}
                {active === 'trips' && (
                    <TripsSection 
                        trips={filteredTrips} 
                        search={tripSearch}
                        onSearchChange={setTripSearch}
                        statusFilter={tripStatusFilter}
                        onStatusFilterChange={setTripStatusFilter}
                        budgetFilter={tripBudgetFilter}
                        onBudgetFilterChange={setTripBudgetFilter}
                        onRefresh={fetchTrips} 
                        onDelete={deleteTrip}
                    />
                )}
                {active === 'library' && (
                    <LibrarySection 
                        destinations={filteredDestinations} 
                        search={destinationSearch}
                        onSearchChange={setDestinationSearch}
                        onRefresh={fetchDestinations} 
                        onDelete={deleteDestination}
                    />
                )}
            </main>
        </div>
    )
}

function OverviewSection({ analytics, budgetStats }: { analytics: Analytics, budgetStats: any }) {
    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Users</p>
                            <p className="text-3xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
                        </div>
                        <div className="text-3xl">👥</div>
                    </div>
                </div>
                
                <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Active Trips</p>
                            <p className="text-3xl font-bold">{analytics.totalTrips.toLocaleString()}</p>
                        </div>
                        <div className="text-3xl">✈️</div>
                    </div>
                </div>
                
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Budget</p>
                            <p className="text-3xl font-bold">
                                ${budgetStats?.totalBudget?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="text-3xl">💰</div>
                    </div>
                </div>
                
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Avg. Budget</p>
                            <p className="text-3xl font-bold">
                                ${budgetStats?.averageBudget?.toFixed(0) || '0'}
                            </p>
                        </div>
                        <div className="text-3xl">📊</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Budget by Month Chart */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">💰 Budget by Month</h3>
                    <div className="h-64">
                        {budgetStats?.budgetByMonth?.length ? (
                            <div className="flex items-end justify-between h-full gap-2">
                                {budgetStats.budgetByMonth.map((item, index) => {
                                    const maxAmount = Math.max(...budgetStats.budgetByMonth.map(d => d.amount))
                                    const height = (item.amount / maxAmount) * 100
                                    return (
                                        <div key={item.month} className="flex flex-col items-center flex-1">
                                            <div className="text-xs text-neutral-500 mb-2 text-center">
                                                {item.month}
                                            </div>
                                            <div 
                                                className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                                                style={{ height: `${Math.max(height, 10)}%` }}
                                            ></div>
                                            <div className="text-xs text-neutral-600 mt-2 font-medium">
                                                ${item.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-neutral-500">
                                No budget data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Budget by Status Chart */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">📈 Budget by Status</h3>
                    <div className="space-y-4">
                        {budgetStats?.budgetByStatus?.map((item) => {
                            const total = budgetStats.budgetByStatus.reduce((sum, d) => sum + d.amount, 0)
                            const percentage = (item.amount / total) * 100
                            return (
                                <div key={item.status} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium capitalize">{item.status}</span>
                                        <span className="text-neutral-600">${item.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-neutral-200 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        }) || (
                            <div className="text-center text-neutral-500 py-8">
                                No status data available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Popular Destinations */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">🌍 Top Destinations</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {analytics.popularDestinations.slice(0, 6).map((dest, index) => (
                        <div key={dest._id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
                                </div>
                                <div>
                                    <div className="font-semibold text-neutral-900">{dest.name}</div>
                                    <div className="text-sm text-neutral-600">Popularity: {dest.popularity}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function UsersSection({ 
    users, 
    search, 
    onSearchChange, 
    onRefresh, 
    onDelete, 
    onToggleStatus 
}: { 
    users: User[]
    search: string
    onSearchChange: (value: string) => void
    onRefresh: () => void
    onDelete: (id: string) => void
    onToggleStatus: (id: string, currentStatus: boolean) => void
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-neutral-900">👥 User Management</h3>
                <div className="flex gap-3">
                    <div className="relative">
                        <input 
                            placeholder="Search users…" 
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-10 w-64 rounded-lg border border-neutral-300 px-4 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" 
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
                    </div>
                    <button 
                        onClick={onRefresh} 
                        className="h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50 transition-colors duration-200"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
                <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-blue-50 text-neutral-700">
                        <tr>
                            {['User ID', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                                <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id} className={`border-t border-neutral-100 transition-colors duration-200 hover:bg-neutral-50 ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-25'}`}>
                                <td className="px-6 py-4 font-mono text-xs text-neutral-600">{user._id.slice(-6)}</td>
                                <td className="px-6 py-4 font-medium">{user.name}</td>
                                <td className="px-6 py-4 text-neutral-700">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        user.role === 'admin' 
                                            ? 'bg-purple-100 text-purple-800' 
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        user.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.isActive ? '✅ Active' : '❌ Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-neutral-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button 
                                        onClick={() => onToggleStatus(user._id, user.isActive)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                                            user.isActive
                                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                    >
                                        {user.isActive ? '⏸️ Suspend' : '▶️ Activate'}
                                    </button>
                                    <button 
                                        onClick={() => onDelete(user._id)}
                                        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200"
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function TripsSection({ 
    trips, 
    search, 
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    budgetFilter,
    onBudgetFilterChange,
    onRefresh, 
    onDelete 
}: { 
    trips: Trip[]
    search: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusFilterChange: (value: string) => void
    budgetFilter: string
    onBudgetFilterChange: (value: string) => void
    onRefresh: () => void
    onDelete: (id: string) => void
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <h3 className="mr-auto text-2xl font-bold text-neutral-900">✈️ Trip Management</h3>
                <div className="relative">
                    <input 
                        placeholder="Search trips..." 
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-10 rounded-lg border border-neutral-300 px-4 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" 
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
                </div>
                <input 
                    placeholder="Max budget" 
                    value={budgetFilter}
                    onChange={(e) => onBudgetFilterChange(e.target.value)}
                    className="h-10 w-32 rounded-lg border border-neutral-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" 
                />
                <select 
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                    <option value="">All Status</option>
                    <option value="planning">📋 Planning</option>
                    <option value="active">🚀 Active</option>
                    <option value="completed">✅ Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                </select>
                <button 
                    onClick={onRefresh} 
                    className="h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50 transition-colors duration-200"
                >
                    🔄 Refresh
                </button>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
                <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-blue-50 text-neutral-700">
                        <tr>
                            {['Trip ID', 'User', 'Destination', 'Start', 'End', 'Budget', 'Status', 'Actions'].map((h) => (
                                <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip, index) => (
                            <tr key={trip._id} className={`border-t border-neutral-100 transition-colors duration-200 hover:bg-neutral-50 ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-25'}`}>
                                <td className="px-6 py-4 font-mono text-xs text-neutral-600">{trip._id.slice(-6)}</td>
                                <td className="px-6 py-4 font-medium">{trip.user.name}</td>
                                <td className="px-6 py-4 text-neutral-700">📍 {trip.location.city}, {trip.location.country}</td>
                                <td className="px-6 py-4 text-neutral-600">{new Date(trip.startDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-neutral-600">{new Date(trip.endDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-semibold text-green-700">
                                    💰 ${trip.budget.amount.toLocaleString()} {trip.budget.currency}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        trip.status === 'active' ? 'bg-green-100 text-green-800' :
                                        trip.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                        trip.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {trip.status === 'active' ? '🚀 Active' :
                                         trip.status === 'completed' ? '✅ Completed' :
                                         trip.status === 'cancelled' ? '❌ Cancelled' :
                                         '📋 Planning'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => onDelete(trip._id)}
                                        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200"
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function LibrarySection({ 
    destinations, 
    search,
    onSearchChange,
    onRefresh, 
    onDelete 
}: { 
    destinations: Destination[]
    search: string
    onSearchChange: (value: string) => void
    onRefresh: () => void
    onDelete: (id: string) => void
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-neutral-900">🌍 Destination Library</h3>
                <div className="flex gap-3">
                    <div className="relative">
                        <input 
                            placeholder="Search destinations..." 
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-10 rounded-lg border border-neutral-300 px-4 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" 
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
                    </div>
                    <button 
                        onClick={onRefresh} 
                        className="h-10 rounded-lg border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50 transition-colors duration-200"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {destinations.map((dest) => (
                    <article key={dest._id} className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-neutral-900 mb-1">{dest.name}</h4>
                                <p className="text-sm text-neutral-600 mb-2">📍 {dest.country}</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-orange-600">
                                        <span>🔥</span>
                                        <span className="font-medium">Popularity: {dest.popularity}</span>
                                    </span>
                                    <span className="flex items-center gap-1 text-green-600">
                                        <span>💰</span>
                                        <span className="font-medium">Cost: {dest.costIndex}</span>
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => onDelete(dest._id)}
                                className="opacity-0 group-hover:opacity-100 rounded-lg p-2 text-red-600 hover:bg-red-50 transition-all duration-200"
                            >
                                🗑️
                            </button>
                        </div>
                        {dest.description && (
                            <p className="text-sm text-neutral-600 line-clamp-2">{dest.description}</p>
                        )}
                    </article>
                ))}
            </div>
        </div>
    )
}


