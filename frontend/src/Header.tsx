import React, { useState } from 'react'

type HeaderProps = {
    onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
    const [open, setOpen] = useState(false)

    return (
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center gap-3">
                    <button
                        type="button"
                        aria-label="Open navigation"
                        onClick={onMenuClick}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 transition hover:bg-neutral-50 lg:hidden"
                    >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
                    </button>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-base font-semibold tracking-tight text-neutral-900">GlobeTrotter</a>
                    </div>

                    <div className="mx-4 hidden flex-1 items-center lg:flex">
                        <div className="relative w-full">
                            <input
                                type="search"
                                placeholder="Search trips, cities, activities…"
                                className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-teal-500"
                            />
                            <span className="pointer-events-none absolute inset-y-0 right-3 my-auto inline-flex h-5 items-center text-neutral-400">
                                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7" strokeWidth="1.5" /><path strokeWidth="1.5" strokeLinecap="round" d="M21 21l-3.8-3.8" /></svg>
                            </span>
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpen((s) => !s)}
                                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-2 py-1 pl-1 pr-2 text-sm text-neutral-800 transition hover:bg-neutral-50"
                                aria-haspopup="menu"
                                aria-expanded={open}
                            >
                                <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-neutral-200"></span>
                                <span className="hidden sm:inline">Alex</span>
                                <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" d="M6 9l6 6 6-6" /></svg>
                            </button>
                            {open && (
                                <div role="menu" className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md">
                                    <button className="block w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50" onClick={() => setOpen(false)}>Profile</button>
                                    <button className="block w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50" onClick={() => setOpen(false)}>Settings</button>
                                    <button className="block w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50" onClick={() => setOpen(false)}>Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}


