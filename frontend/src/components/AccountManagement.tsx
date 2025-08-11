import React, { useState } from 'react'
import { Shield, Trash2 } from 'lucide-react'

export default function AccountManagement() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  function changePassword() {
    setInfo('Password change link sent to your email.')
    setTimeout(() => setInfo(null), 1500)
  }

  function deleteAccount() {
    setConfirmOpen(true)
  }

  function confirmDelete() {
    setConfirmOpen(false)
    setInfo('Account deletion scheduled. This is a demo UI.')
    setTimeout(() => setInfo(null), 2000)
  }

  return (
    <section className="relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">Account Management</h3>
      {info && (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{info}</div>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          onClick={changePassword}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
        >
          <Shield className="h-4.5 w-4.5" /> Change password
        </button>
        <button
          onClick={deleteAccount}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
        >
          <Trash2 className="h-4.5 w-4.5" /> Delete account
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-lg">
            <h4 className="text-sm font-semibold text-neutral-900">Confirm deletion</h4>
            <p className="mt-1 text-sm text-neutral-600">This action cannot be undone. Are you sure you want to delete your account?</p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50">Cancel</button>
              <button onClick={confirmDelete} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}


