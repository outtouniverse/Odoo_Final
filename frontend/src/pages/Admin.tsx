import React, { useMemo, useState, useEffect } from 'react'
import { useRouter, Link } from '../utils/router'
import KPICard from '../components/admin/KPICard'
import { useAuth } from '../utils/auth'
import { apiFetch } from '../utils/api'

type SectionKey = 'overview' | 'users' | 'trips' | 'moderation' | 'library' | 'analytics' | 'settings'

const sections: { key: SectionKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'trips', label: 'Trips' },
    { key: 'moderation', label: 'Moderation' },
    { key: 'library', label: 'Destinations' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'settings', label: 'Settings' },
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

    const visibleSections = useMemo(() => {
        // Only super_admin can see all sections
        return sections
    }, [])

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
                        await Promise.all([
                            fetchUsers(),
                            fetchTrips(),
                            fetchAnalytics()
                        ])
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
                    case 'analytics':
                        await fetchAnalytics()
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

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link to="/" className="text-base font-semibold tracking-tight text-neutral-900">GlobeTrotter Admin</Link>
                        <nav className="hidden items-center gap-6 text-sm text-neutral-700 md:flex" aria-label="Admin">
                            {visibleSections.map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setSection(s.key)}
                                    className={`rounded-md px-2 py-1 ${active === s.key ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'}`}
                                    aria-current={active === s.key ? 'page' : undefined}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </nav>
                        <div className="flex items-center gap-2">
                            <span className="hidden text-sm text-neutral-700 md:inline">{user?.name} · Super Admin</span>
                            <button onClick={logout} className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50">Logout</button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                
                {loading && (
                    <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        Loading data...
                    </div>
                )}

                {active === 'overview' && <OverviewSection analytics={analytics} />}
                {active === 'users' && <UsersSection users={users} onRefresh={fetchUsers} />}
                {active === 'trips' && <TripsSection trips={trips} onRefresh={fetchTrips} />}
                {active === 'moderation' && <ModerationSection />}
                {active === 'library' && <LibrarySection destinations={destinations} onRefresh={fetchDestinations} />}
                {active === 'analytics' && <AnalyticsSection analytics={analytics} />}
                {active === 'settings' && <SettingsSection />}
            </main>
        </div>
    )
}

function OverviewSection({ analytics }: { analytics: Analytics }) {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Total Users" value={analytics.totalUsers.toLocaleString()} trend="↑ 3.1%" />
                <KPICard title="Active Trips" value={analytics.totalTrips.toLocaleString()} trend="↑ 1.4%" />
                <KPICard title="Avg. Trip Budget" value="$2,130" trend="≈" />
                <KPICard title="Flagged Items" value="19" trend="↓ 0.6%" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Trips Created Over Time</h3>
                        <span className="text-xs text-neutral-500">Last 12 months</span>
                    </div>
                    {/* lightweight placeholder chart */}
                    <div className="mt-4 h-48 w-full">
                        <svg viewBox="0 0 400 160" className="h-full w-full">
                            <defs>
                                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#0f766e" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#0f766e" stopOpacity="0.05" />
                                </linearGradient>
                            </defs>
                            <polyline fill="url(#grad)" stroke="#0f766e" strokeWidth="2" points="0,120 40,110 80,95 120,105 160,80 200,70 240,60 280,65 320,50 360,40 400,35 400,160 0,160" />
                        </svg>
                    </div>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold">Top Cities</h3>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                        {analytics.popularDestinations.slice(0, 5).map((dest) => (
                            <li key={dest._id} className="flex items-center justify-between">
                                <span>{dest.name}</span>
                                <span className="text-neutral-500">{dest.popularity}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

function UsersSection({ users, onRefresh }: { users: User[], onRefresh: () => void }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Management</h3>
                <div className="flex gap-2">
                    <input placeholder="Search users…" className="h-9 w-56 rounded-md border border-neutral-300 px-3 text-sm" />
                    <button onClick={onRefresh} className="h-9 rounded-md border border-neutral-300 px-3 text-sm hover:bg-neutral-50">Refresh</button>
                    <button className="h-9 rounded-md border border-neutral-300 px-3 text-sm hover:bg-neutral-50">Export CSV</button>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-600">
                        <tr>
                            {['User ID', 'Name', 'Email', 'Role', 'Status', 'Joined', ''].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-t border-neutral-200">
                                <td className="px-4 py-3">{user._id.slice(-6)}</td>
                                <td className="px-4 py-3">{user.name}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">{user.role}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right">
                                    <button className="rounded-md px-2 py-1 text-xs text-teal-700 hover:bg-teal-50">View</button>
                                    <button className="ml-1 rounded-md px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">Edit</button>
                                    <button className="ml-1 rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50">Suspend</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function TripsSection({ trips, onRefresh }: { trips: Trip[], onRefresh: () => void }) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="mr-auto text-lg font-semibold">Trip Management</h3>
                <input placeholder="Destination" className="h-9 rounded-md border border-neutral-300 px-3 text-sm" />
                <input placeholder="Budget ≤" className="h-9 w-28 rounded-md border border-neutral-300 px-3 text-sm" />
                <select className="h-9 rounded-md border border-neutral-300 px-2 text-sm">
                    <option>Status</option>
                    <option>Public</option>
                    <option>Private</option>
                    <option>Flagged</option>
                </select>
                <button onClick={onRefresh} className="h-9 rounded-md border border-neutral-300 px-3 text-sm hover:bg-neutral-50">Refresh</button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-600">
                        <tr>
                            {['Trip ID', 'User', 'Destinations', 'Start', 'End', 'Budget', 'Status', ''].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip) => (
                            <tr key={trip._id} className="border-t border-neutral-200">
                                <td className="px-4 py-3">{trip._id.slice(-6)}</td>
                                <td className="px-4 py-3">{trip.user.name}</td>
                                <td className="px-4 py-3">{trip.location.city}, {trip.location.country}</td>
                                <td className="px-4 py-3">{new Date(trip.startDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{new Date(trip.endDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3">${trip.budget.amount.toLocaleString()} {trip.budget.currency}</td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                        {trip.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="rounded-md px-2 py-1 text-xs text-teal-700 hover:bg-teal-50">View</button>
                                    <button className="ml-1 rounded-md px-2 py-1 text-xs text-amber-700 hover:bg-amber-50">Flag</button>
                                    <button className="ml-1 rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function ModerationSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content Moderation</h3>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <ul className="space-y-3 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                            <div>
                                <div className="font-medium">Reported review #{300 + i}</div>
                                <div className="text-xs text-neutral-600">Reason: Inappropriate language</div>
                            </div>
                            <div className="flex gap-2">
                                <button className="rounded-md px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50">Approve</button>
                                <button className="rounded-md px-2 py-1 text-xs text-amber-700 hover:bg-amber-50">Edit</button>
                                <button className="rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50">Remove</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

function LibrarySection({ destinations, onRefresh }: { destinations: Destination[], onRefresh: () => void }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Destination & Activity Library</h3>
                <div className="flex gap-2">
                    <button onClick={onRefresh} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Refresh</button>
                    <button className="rounded-md bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700">Add Item</button>
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {destinations.map((dest) => (
                    <article key={dest._id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">{dest.name}</h4>
                                <p className="text-xs text-neutral-600">{dest.country}</p>
                                <p className="text-xs text-neutral-500">Popularity: {dest.popularity}</p>
                            </div>
                            <div className="flex gap-1">
                                <button className="rounded-md px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">Edit</button>
                                <button className="rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}

function AnalyticsSection({ analytics }: { analytics: Analytics }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Analytics</h3>
                <div className="flex gap-2">
                    <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Export CSV</button>
                    <button className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Export PDF</button>
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold">Average Spend Per Trip</h4>
                    <div className="mt-3 h-48 w-full">
                        <svg viewBox="0 0 400 160" className="h-full w-full">
                            <rect x="30" y="40" width="30" height="90" fill="#0ea5e9" />
                            <rect x="90" y="20" width="30" height="110" fill="#10b981" />
                            <rect x="150" y="55" width="30" height="75" fill="#f59e0b" />
                            <rect x="210" y="35" width="30" height="95" fill="#ef4444" />
                            <rect x="270" y="60" width="30" height="70" fill="#8b5cf6" />
                        </svg>
                    </div>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold">Most Common Travel Months</h4>
                    <div className="mt-3 grid grid-cols-6 gap-2 text-xs">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                            <div key={m} className="rounded-lg bg-teal-50 p-2 text-center text-teal-800">
                                {m}
                                <div className="mt-1 h-2 rounded bg-teal-600" style={{ width: `${20 + (i % 6) * 12}%` }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function SettingsSection() {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">System Settings</h3>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold">Maintenance Mode</h4>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                        <input id="maint" type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-teal-600" />
                        <label htmlFor="maint">Enable maintenance mode</label>
                    </div>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold">Feature Flags</h4>
                    <div className="mt-3 space-y-2 text-sm">
                        {['beta_analytics', 'new_editor', 'ai_assistant'].map((f) => (
                            <label key={f} className="flex items-center gap-3">
                                <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-teal-600" />
                                <span>{f}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold">API Keys</h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {['maps', 'weather', 'currency'].map((k) => (
                        <div key={k} className="flex items-center gap-2">
                            <label className="w-28 text-sm text-neutral-600">{k}</label>
                            <input className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm" placeholder={`Enter ${k} key`} />
                            <button className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50">Save</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


