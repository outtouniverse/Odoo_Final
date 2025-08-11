import React from 'react'
import type { Suggestion } from './suggestions'

export default function ExpensesCard({ s }: { s: Suggestion }) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <h4 className="text-sm font-semibold text-neutral-900">Expenses</h4>
      <div className="mt-2 max-h-56 ">
        <ul className="divide-y divide-neutral-200">
          {s.details.pricing.map((p) => (
            <li key={p.label} className="flex items-center justify-between py-2 text-sm">
              <div>
                <div className="text-neutral-800">{p.label}</div>
                {p.note && <div className="text-xs text-neutral-500">{p.note}</div>}
              </div>
              <div className="font-medium text-neutral-900">${p.amountUsd.toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}


