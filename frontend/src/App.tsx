function Icon({ name, className = 'h-5 w-5' }: { name: 'drag' | 'budget' | 'city' | 'discovery' | 'timeline' | 'share' | 'plan' | 'organize' | 'publish'; className?: string }) {
  switch (name) {
    case 'drag':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M9 21h6M3 9v6M21 9v6M8 8l8 8M16 8l-8 8" />
        </svg>
      )
    case 'budget':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
          <path strokeWidth="1.5" d="M8 14h1.5M8 10h8M12 14h4" />
        </svg>
      )
    case 'city':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M6 20V8l6-3 6 3v12M10 20v-6h4v6" />
        </svg>
      )
    case 'discovery':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
          <circle cx="11" cy="11" r="7" strokeWidth="1.5" />
          <path strokeWidth="1.5" strokeLinecap="round" d="M21 21l-4.3-4.3" />
          <path strokeWidth="1.5" d="M8 12l7-3-3 7-4-4z" />
        </svg>
      )
    case 'timeline':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
          <path strokeWidth="1.5" strokeLinecap="round" d="M4 7h16M4 12h8M4 17h12" />
          <circle cx="14" cy="12" r="2" strokeWidth="1.5" />
        </svg>
      )
    case 'share':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M7 12v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7" />
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4 4-4" />
        </svg>
      )
    case 'plan':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 3v6M17 3v6M6 11h12v8H6z" />
        </svg>
      )
    case 'organize':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
          <rect x="3" y="4" width="7" height="7" rx="1.5" strokeWidth="1.5" />
          <rect x="14" y="4" width="7" height="7" rx="1.5" strokeWidth="1.5" />
          <rect x="3" y="15" width="7" height="7" rx="1.5" strokeWidth="1.5" />
        </svg>
      )
    case 'publish':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 12l8-8 8 8M6 10v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" />
        </svg>
      )
  }
}

function DeviceMock() {
  return (
    <div className="relative mx-auto w-full max-w-[640px] rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="h-9 w-full border-b border-neutral-200 flex items-center gap-1.5 px-3">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-neutral-300"></span>
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-neutral-300"></span>
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-neutral-300"></span>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-3 text-xs text-neutral-500">
          <div className="col-span-1 rounded-md border border-neutral-200 p-3">
            <div className="mb-2 h-3 w-20 rounded bg-neutral-200"></div>
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-2.5 w-full rounded bg-neutral-100"></div>
              ))}
            </div>
          </div>
          <div className="col-span-2 rounded-md border border-neutral-200 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-3 w-28 rounded bg-neutral-200"></div>
              <div className="h-7 w-24 rounded-md bg-teal-500/10"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-md bg-neutral-100"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="text-base font-semibold tracking-tight text-neutral-900">GlobeTrotter</a>
            <nav className="hidden items-center gap-8 text-sm text-neutral-700 md:flex">
              <a href="#features" className="hover:text-neutral-900">Features</a>
              <a href="#how" className="hover:text-neutral-900">How It Works</a>
              <a href="#demo" className="hover:text-neutral-900">Demo</a>
              <a href="/login" className="hover:text-neutral-900">Login</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href="/login" className="inline-flex items-center rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">Plan Your Trip</a>
              <button aria-label="Open Menu" className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 transition hover:bg-neutral-50">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Plan your adventures. Your way.</p>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl">Travel Planning, Reinvented.</h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">Create, customize, and share your dream trips with an interactive canvas. GlobeTrotter makes organizing multi-city itineraries feel as exciting as the journey itself.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href="#demo" className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">Try the Demo</a>
                <a href="https://github.com/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50">View on GitHub</a>
              </div>
            </div>
            <div className="relative">
              <DeviceMock />
            </div>
          </div>
        </div>
      </section>

      {/* Features Masonry */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Powerful, without the noise</h2>
            <p className="mt-1 text-sm text-neutral-600">Everything you need to plan smarter trips — intentionally simple and thoughtfully designed.</p>
          </div>
        </div>

        <div className="masonry columns-1 md:columns-2 lg:columns-3">
          {[
            {
              icon: 'drag',
              title: 'Drag-and-Drop Itinerary',
              desc: 'Build trips like a canvas. Reorder days, move activities, and structure your plan in seconds.'
            },
            {
              icon: 'budget',
              title: 'Budget Heatmap',
              desc: 'Track costs as you go. Visual breakdowns help you stay on budget without spreadsheets.'
            },
            {
              icon: 'city',
              title: 'Multi-City Planner',
              desc: 'Plan across cities and countries. Map your route and keep travel details organized.'
            },
            {
              icon: 'discovery',
              title: 'Activity Discovery',
              desc: 'Search places, attractions, and hidden gems. Save them straight to your itinerary.'
            },
            {
              icon: 'timeline',
              title: 'Timeline & Calendar View',
              desc: 'Switch between high-level timelines and detailed day views to keep context clear.'
            },
            {
              icon: 'share',
              title: 'One-Click Sharing',
              desc: 'Publish and share your trip with friends. Collaborate in real-time on the plan.'
            }
          ].map((f, i) => (
            <article key={i} className="masonry-item group inline-block w-full rounded-2xl border border-neutral-200 bg-white p-5 align-top shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
                  <Icon name={f.icon as any} className="h-5 w-5" />
                </span>
                <h3 className="text-sm font-medium text-neutral-900">{f.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="border-y border-neutral-200 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-neutral-900">How it works</h2>
          <div className="grid items-start gap-6 sm:grid-cols-3">
            {[
              { icon: 'plan', title: 'Plan', desc: 'Start a new trip. Add cities, dates, and the basics.' },
              { icon: 'organize', title: 'Organize', desc: 'Drag and drop activities to craft each day, your way.' },
              { icon: 'publish', title: 'Share', desc: 'Publish your itinerary and invite friends to collaborate.' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
                  <Icon name={s.icon as any} className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-medium text-neutral-900">{s.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="get-started" className="bg-teal-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-teal-100 bg-white/70 p-8 text-center shadow-sm md:flex-row md:text-left">
            <div>
              <h3 className="text-lg font-medium text-neutral-900">Start planning your next adventure today.</h3>
              <p className="mt-1 text-sm text-neutral-600">GlobeTrotter brings clarity to complex trips — with an interface that stays out of the way.</p>
            </div>
            <a href="#demo" className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">Get Started</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">About</h4>
              <p className="mt-2 text-sm text-neutral-600">GlobeTrotter is an interactive, personalized travel planner for crafting multi-city adventures with clarity and ease.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Links</h4>
              <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                <li><a href="#features" className="hover:text-neutral-900">Features</a></li>
                <li><a href="#how" className="hover:text-neutral-900">How It Works</a></li>
                <li><a href="#demo" className="hover:text-neutral-900">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Social</h4>
              <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                <li><a href="#" className="hover:text-neutral-900">Twitter</a></li>
                <li><a href="#" className="hover:text-neutral-900">Instagram</a></li>
                <li><a href="#" className="hover:text-neutral-900">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">© {new Date().getFullYear()} GlobeTrotter. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

