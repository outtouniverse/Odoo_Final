import React, { useState } from 'react'

const defaultItems = [
  { id: 'p1', label: 'Passport', done: false },
  { id: 'p2', label: 'Universal adapter', done: true },
  { id: 'p3', label: 'Comfortable shoes', done: false },
]

export default function PackingListCard() {
  const [items, setItems] = useState(defaultItems)
  const [input, setInput] = useState('')

  function toggle(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  }
  function addItem(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!input.trim()) return
    setItems((prev) => [...prev, { id: crypto.randomUUID(), label: input.trim(), done: false }])
    setInput('')
  }

  return (
    <article className="rounded-lg bg-neutral-950/95 relative border border-neutral-800 p-4 max-w-xs mx-auto shadow-lg h-full">
      <form onSubmit={addItem} className="flex mb-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add item…"
          className="flex-1 bg-transparent border-0 border-b border-neutral-700 text-white placeholder:text-neutral-500 focus:outline-none focus:border-yellow-400 py-1 px-2 text-sm"
        />
        <button
          type="submit"
          className="ml-2 px-2 py-1 rounded bg-yellow-400 text-neutral-900 text-xs font-bold hover:bg-yellow-300 transition"
          aria-label="Add"
        >+</button>
      </form>
      <ul className="space-y-1 mt-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-center group">
            <button
              onClick={() => toggle(i.id)}
              className={`h-5 w-5 mr-2 rounded-full border-2 flex items-center justify-center transition
                ${i.done ? 'border-yellow-400 bg-yellow-400' : 'border-neutral-700'}
                focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              aria-label={i.done ? "Mark as not packed" : "Mark as packed"}
            >
              {i.done && (
                <svg className="w-3 h-3 text-neutral-900" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 16 16">
                  <path d="M4 8l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={`text-sm transition truncate ${i.done ? 'text-neutral-500 line-through' : 'text-white'}`}>
              {i.label}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-xs text-neutral-500 text-center italic select-none tracking-wide absolute bottom-0 left-0 right-0 p-2">
        ✈️ keep it light, travel bright
      </div>
    </article>
  )
}
