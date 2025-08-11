import React from 'react'

type StatsCardProps = {
  label: string
  value: string | number
  icon?: React.ReactNode
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-600">{label}</p>
        {icon && <span className="text-neutral-500">{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">{value}</div>
    </div>
  )
}


