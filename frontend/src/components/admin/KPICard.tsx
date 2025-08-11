import React from 'react'

interface KPICardProps {
  title: string
  value: string
  trend: string
}

export default function KPICard({ title, value, trend }: KPICardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-600">{title}</p>
          <p className="text-lg font-semibold text-neutral-900">{value}</p>
        </div>
        <div className="text-xs text-neutral-500">{trend}</div>
      </div>
    </div>
  )
}
