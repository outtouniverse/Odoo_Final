import React, { useState } from 'react'
import { Globe, Wallet } from 'lucide-react'

type PreferencesProps = {
  initialLanguage?: string
  initialCurrency?: string
  onChange?: (prefs: { language: string; currency: string }) => void
}

export default function Preferences({ initialLanguage = 'English', initialCurrency = 'USD', onChange }: PreferencesProps) {
  const [language, setLanguage] = useState(initialLanguage)
  const [currency, setCurrency] = useState(initialCurrency)

  function updateLanguage(value: string) {
    setLanguage(value)
    onChange?.({ language: value, currency })
  }
  function updateCurrency(value: string) {
    setCurrency(value)
    onChange?.({ language, currency: value })
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Preferences</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="language" className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><Globe className="h-3.5 w-3.5" /> Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => updateLanguage(e.target.value)}
            className="w-full appearance-none rounded-lg border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition focus:bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option>English</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
            <option>Português</option>
            <option>日本語</option>
          </select>
        </div>
        <div>
          <label htmlFor="currency" className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><Wallet className="h-3.5 w-3.5" /> Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => updateCurrency(e.target.value)}
            className="w-full appearance-none rounded-lg border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition focus:bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>JPY</option>
            <option>CAD</option>
            <option>AUD</option>
          </select>
        </div>
      </div>
    </section>
  )
}


