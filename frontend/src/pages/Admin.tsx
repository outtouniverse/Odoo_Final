import React, { useMemo } from 'react'
import { useAuth } from '../utils/auth'
import { useRouter, Link } from '../utils/router'
import KPICard from '../components/admin/KPICard'

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

export default function Admin() {
    const { user, isAuthenticated, hasRole, logout } = useAuth()
    const { navigate, path } = useRouter()

    // Guard: require auth and admin roles
    const allowed = isAuthenticated && hasRole(['super_admin', 'moderator', 'support'])
    if (!allowed) {
        navigate('/login', { replace: true })
        return null
    }

    const visibleSections = useMemo(() => {
        if (user?.role === 'super_admin') return sections
        if (user?.role === 'moderator') return sections.filter((s) => ['overview', 'trips', 'moderation', 'analytics'].includes(s.key))
        return sections.filter((s) => ['overview', 'analytics'].includes(s.key))
    }, [user?.role])

    const active: SectionKey = useMemo(() => {
        const hash = path.split('#')[1] || ''
        const candidate = visibleSections.find((s) => s.key === hash)
        return (candidate?.key || 'overview') as SectionKey
    }, [path, visibleSections])

    function setSection(key: SectionKey) {
        navigate(`/admin#${key}`)
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
                            <span className="hidden text-sm text-neutral-700 md:inline">{user?.name} · {user?.role.replace('_', ' ')}</span>
                            <button onClick={logout} className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50">Logout</button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {active === 'overview' && <OverviewSection />}
                {active === 'users' && (user?.role === 'super_admin' ? <UsersSection /> : <NotAllowed />)}
                {active === 'trips' && (user?.role === 'super_admin' || user?.role === 'moderator' ? <TripsSection /> : <NotAllowed />)}
                {active === 'moderation' && (user?.role === 'super_admin' || user?.role === 'moderator' ? <ModerationSection /> : <NotAllowed />)}
                {active === 'library' && (user?.role === 'super_admin' || user?.role === 'moderator' ? <LibrarySection /> : <NotAllowed />)}
                {active === 'analytics' && <AnalyticsSection />}
                {active === 'settings' && (user?.role === 'super_admin' ? <SettingsSection /> : <NotAllowed />)}
            </main>
        </div>
    )
}

function OverviewSection() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Total Users" value="12,480" trend="↑ 3.1%" />
                <KPICard title="Active Trips" value="842" trend="↑ 1.4%" />
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
                        {['Paris', 'Tokyo', 'Barcelona', 'New York', 'Bangkok'].map((c) => (
                            <li key={c} className="flex items-center justify-between">
                                <span>{c}</span>
                                <span className="text-neutral-500">{Math.floor(Math.random() * 400) + 100}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

function NotAllowed() {
    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            You do not have permission to view this section.
        </div>
    )
}

function UsersSection() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Management</h3>
                <div className="flex gap-2">
                    <input placeholder="Search users…" className="h-9 w-56 rounded-md border border-neutral-300 px-3 text-sm" />
                    <button className="h-9 rounded-md border border-neutral-300 px-3 text-sm hover:bg-neutral-50">Export CSV</button>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-600">
                        <tr>
                            {['User ID', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Trips', ''].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i} className="border-t border-neutral-200">
                                <td className="px-4 py-3">usr_{1000 + i}</td>
                                <td className="px-4 py-3">Alex Traveler</td>
                                <td className="px-4 py-3">alex{i}@mail.com</td>
                                <td className="px-4 py-3">user</td>
                                <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Active</span></td>
                                <td className="px-4 py-3">2024-01-0{i + 1}</td>
                                <td className="px-4 py-3">{Math.floor(Math.random() * 6)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button className="rounded-md px-2 py-1 text-xs text-teal-700 hover:bg-teal-50">View</button>
                                    <button className="ml-1 rounded-md px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">Edit</button>
                                    <button className="ml-1 rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50">Suspend</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600">
                    <span>Page 1 of 10</span>
                    <div className="flex gap-2">
                        <button className="rounded-md border border-neutral-300 px-2 py-1 hover:bg-neutral-50">Prev</button>
                        <button className="rounded-md border border-neutral-300 px-2 py-1 hover:bg-neutral-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TripsSection() {
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
                        {Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="border-t border-neutral-200">
                                <td className="px-4 py-3">trip_{500 + i}</td>
                                <td className="px-4 py-3">Jamie Voyager</td>
                                <td className="px-4 py-3">Paris, Rome</td>
                                <td className="px-4 py-3">2025-05-0{i + 1}</td>
                                <td className="px-4 py-3">2025-05-1{i + 1}</td>
                                <td className="px-4 py-3">${(1200 + i * 230).toLocaleString()}</td>
                                <td className="px-4 py-3">Public</td>
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

function LibrarySection() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Destination & Activity Library</h3>
                <button className="rounded-md bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700">Add Item</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <article key={i} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">City #{i + 1}</h4>
                                <p className="text-xs text-neutral-600">Tags: beach, food</p>
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

function AnalyticsSection() {
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


