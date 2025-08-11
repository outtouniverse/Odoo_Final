import React, { useMemo, useRef, useState } from 'react'
import { Camera, Mail, User, Check } from 'lucide-react'

type ProfileCardProps = {
  initialName?: string
  initialEmail?: string
  initialAvatarUrl?: string
}

export default function ProfileCard({ initialName = 'Alex Traveler', initialEmail = 'alex@example.com', initialAvatarUrl }: ProfileCardProps) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatarUrl)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const isValid = useMemo(() => {
    const validEmail = /.+@.+\..+/.test(email)
    return name.trim().length >= 2 && validEmail
  }, [name, email])

  function onPickAvatar() {
    fileRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
  }

  async function onSave() {
    setError(null)
    if (!isValid) {
      setError('Please provide a valid name and email.')
      return
    }
    setSaving(true)
    setSaved(false)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Profile</h2>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative">
          <button type="button" onClick={onPickAvatar} className="group relative inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-neutral-400" />
            )}
            <span className="absolute inset-0 hidden items-center justify-center bg-black/20 text-white group-hover:flex">
              <Camera className="h-5 w-5" />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>
        <div className="text-xs text-neutral-500">Click the avatar to upload a new photo.</div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><User className="h-3.5 w-3.5" /> Full name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-800"><Mail className="h-3.5 w-3.5" /> Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {saved && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100">
          <Check className="h-3.5 w-3.5" /> Saved
        </div>
      )}

      <div className="mt-5">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </section>
  )
}


