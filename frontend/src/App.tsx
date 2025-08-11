/*
  App.tsx
  Standalone landing page inspired by the attached travel agency design.
  - Uses Tailwind utility classes only
  - Hero section copy tailored for a smart, all‑in‑one trip dashboard
  - Uses provided hero desert and mountain images
*/

import React, { useState } from "react"

type NavLink = {
  label: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { label: 'Homepage', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Services', href: '#' },
  { label: 'travel agency', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Pages', href: '#' },
  { label: 'Destinations', href: '#' },
]

const CARD_DATA = [
  {
    title: 'The Saqqara Necropolis',
    subtitle: 'Egypt, North Africa',
    rating: 4.5,
    img:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', // Saqqara Necropolis, Egypt
  },
  {
    title: 'Royal Palace of Madrid',
    subtitle: 'Spain, Europe',
    rating: 4.7,
    img:
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80', // Royal Palace of Madrid, Spain
  },
  {
    title: 'Statue of Martin Luther',
    subtitle: 'Germany, Europe',
    rating: 4.6,
    img:
      'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80', // Martin Luther statue, Germany
  },
]

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  )
}

function IconStar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-neutral-900 shadow-sm">
      {children}
    </span>
  )
}

export default function App() {
  return (
    <div className="min-h-screen w-full ">
      {/* Outer framed card */}
      <div className="mx-auto bg-white overflow-hidden">
        {/* Top Navigation */}
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

        {/* HERO with desert background */}
        <section className="relative">
          <div className="relative h-[520px] w-full overflow-hidden">
            <img
              src="https://cdn.hswstatic.com/gif/gettyimages-1604716378.jpg"
              alt="Sahara dunes"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/20" />

            {/* Scroll indicator left */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
              <div className="flex items-center gap-2 text-white/90">
                <div className="rounded-full border border-white/70 px-2 py-1 text-[10px] tracking-wider">SCROLL DOWN</div>
              </div>
            </div>

            {/* Play button right */}
            <div className="absolute right-6 bottom-8">
              <button className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/10 text-white backdrop-blur">
                <IconPlay className="h-4 w-4" />
              </button>
            </div>

            {/* Headings */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <h2 className="font-serif text-4xl text-white/90 md:text-5xl">Mysteries of</h2>
              <h1 className="mt-2 font-sans text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl">
                The Desert
              </h1>

            </div>

            {/* Search/filters bar */}

          </div>
        </section>
        {/*
          Functional Search/Filters Bar with Section Switching and Dropdowns
        */}
        {(() => {
          // Section tabs and dropdown options
          const SECTIONS = [
            {
              label: "Flights",
              filters: [
                { label: "Destination", options: ["Paris", "Tokyo", "New York"] },
                { label: "Class", options: ["Economy", "Business", "First"] },
                { label: "Passengers", options: ["1", "2", "3+", "Family"] },
              ],
            },
            {
              label: "Hotel",
              filters: [
                { label: "Location", options: ["Downtown", "Beach", "Suburbs"] },
                { label: "Stars", options: ["3", "4", "5"] },
                { label: "Guests", options: ["1", "2", "3+", "Family"] },
              ],
            },
            {
              label: "Adventure",
              filters: [
                { label: "Type", options: ["Safari", "Hiking", "Diving"] },
                { label: "Difficulty", options: ["Easy", "Moderate", "Hard"] },
                { label: "Duration", options: ["1 day", "3 days", "1 week"] },
              ],
            },
          ];

          // React state hooks
          const [activeSection, setActiveSection] = useState(0);
          const [dropdownOpen, setDropdownOpen] = useState([false, false, false]);
          const [selectedOptions, setSelectedOptions] = useState([
            Array(SECTIONS[0].filters.length).fill(""),
            Array(SECTIONS[1].filters.length).fill(""),
            Array(SECTIONS[2].filters.length).fill(""),
          ]);

          // Handlers
          function handleTab(idx: number) {
            setActiveSection(idx);
            setDropdownOpen([false, false, false]);
          }
          function toggleDropdown(idx: number) {
            setDropdownOpen((prev) =>
              prev.map((open, i) => (i === idx ? !open : false))
            );
          }
          function selectOption(filterIdx: number, option: string) {
            setSelectedOptions((prev) => {
              const updated = prev.map((arr) => [...arr]);
              updated[activeSection][filterIdx] = option;
              return updated;
            });
            setDropdownOpen([false, false, false]);
          }

          const section = SECTIONS[activeSection];

          return (
            <div className="absolute bottom-0 left-1/2 w-[90%] -translate-x-1/2 md:w-4/5 z-10">
              <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5">
                {/* Section Tabs */}
                <div className="flex gap-6 px-1 text-xs text-neutral-500">
                  {SECTIONS.map((s, idx) => (
                    <button
                      key={s.label}
                      className={
                        "transition font-medium " +
                        (activeSection === idx
                          ? "text-neutral-900"
                          : "hover:text-neutral-800")
                      }
                      onClick={() => handleTab(idx)}
                      aria-pressed={activeSection === idx}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {/* Filters */}
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3 relative">
                    {section.filters.map((filter, idx) => (
                      <div
                        key={filter.label}
                        className="relative"
                      >
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
                          onClick={() => toggleDropdown(idx)}
                          aria-haspopup="listbox"
                          aria-expanded={dropdownOpen[idx]}
                        >
                          <span>
                            {selectedOptions[activeSection][idx]
                              ? `${filter.label}: ${selectedOptions[activeSection][idx]}`
                              : filter.label}
                          </span>
                          <IconChevronDown className={"h-4 w-4 transition-transform " + (dropdownOpen[idx] ? "rotate-180" : "")} />
                        </button>
                        {/* Dropdown */}
                        {dropdownOpen[idx] && (
                          <ul
                            className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg"
                            role="listbox"
                          >
                            {filter.options.map((option) => (
                              <li
                                key={option}
                                className={
                                  "cursor-pointer px-4 py-2 text-sm hover:bg-neutral-100 " +
                                  (selectedOptions[activeSection][idx] === option
                                    ? "font-semibold text-black"
                                    : "")
                                }
                                onClick={() => selectOption(idx, option)}
                                role="option"
                                aria-selected={selectedOptions[activeSection][idx] === option}
                              >
                                {option}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="h-12 rounded-xl bg-black px-6 text-sm font-semibold text-white mt-2 md:mt-0">
                    Explore All
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
        {/* Explore section */}
        <section className="px-8 py-20 mt-20 md:pt-24">
          <div className="text-center">
            <p className="font-serif text-2xl text-neutral-700 md:text-3xl">Explore the</p>
            <h3 className="-mt-1 text-4xl font-extrabold tracking-tight text-neutral-900 md:text-6xl">beautiful</h3>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {CARD_DATA.map((c) => (
              <article key={c.title} className="group relative overflow-hidden rounded-2xl bg-neutral-100 shadow-sm ring-1 ring-black/5">
                <img src={c.img} alt={c.title} className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105" />

                {/* Rating */}
                <div className="absolute right-3 top-3">
                  <Badge>
                    <IconStar className="h-3.5 w-3.5 text-amber-400" />
                    {c.rating.toFixed(1)}
                  </Badge>
                </div>

                {/* Copy */}
                <div className="p-5">
                  <h4 className="text-base font-semibold text-white md:text-transparent md:bg-clip-text md:bg-gradient-to-b md:from-neutral-900 md:to-neutral-900/80">
                    {/* Use white text when image overlays, otherwise normal text */}
                    <span className="block text-neutral-900">{c.title}</span>
                  </h4>
                  <p className="mt-1 text-xs text-neutral-500">{c.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Frozen trails section */}
        <section className="relative px-6">
          <div className="text-center">
            <span className="mx-auto inline-block rounded-full border border-neutral-300 px-3 py-1 text-[10px] uppercase tracking-wider text-neutral-600">
              Travel Layout Pack
            </span>
            <h3 className="mt-4 font-serif text-3xl text-neutral-800 md:text-4xl">Conquer the</h3>
            <h2 className="-mt-1 text-5xl font-extrabold tracking-tight text-neutral-900 md:text-7xl">Frozen Trails</h2>
            <img
              src="https://pngimg.com/d/mountain_PNG8.png"
              alt="Everest mountain"
              className=" mx-auto w-full absolute -bottom-36 object-cover"
            />

          </div>

          <div className="relative mx-auto mt-8 w-full h-96">
            {/* Mountain image */}

            {/* Left stat */}
            <div className="absolute left-0 top-12 hidden translate-x-[-30%] md:block">
              <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm shadow-md ring-1 ring-black/5">
                <div className="flex items-center gap-2">
                  <div className="-space-x-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span
                        key={i}
                        className="inline-block h-6 w-6 rounded-full border-2 border-white bg-neutral-300"
                        style={{ marginLeft: i === 0 ? 0 : -8 }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="text-lg font-bold">529+</div>
                    <div className="-mt-0.5 text-[11px] text-neutral-500">People Already Booked</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right temperature */}
            <div className="absolute right-2 top-8 hidden md:block">
              <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm shadow-md ring-1 ring-black/5">
                <div className="text-[11px] text-neutral-500">Temperature</div>
                <div className="text-sm font-semibold text-neutral-900">-20°C to -40°C</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer credit strip */}
    </div>
  )
}


