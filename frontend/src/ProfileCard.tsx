import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Mail, User, Check, Trash2, Plus, Globe, Settings, Shield } from 'lucide-react'
import { apiFetch } from './api'

type ProfileCardProps = {
  initialName?: string
  initialEmail?: string
  initialAvatarUrl?: string
}

type SavedDestination = {
  _id?: string
  name: string
  city: string
  country: string
  coordinates?: { latitude?: number; longitude?: number }
  notes?: string
  savedAt?: string
}

type NotificationsPref = { email?: boolean; push?: boolean; marketing?: boolean }

type Preferences = {
  language?: string
  timezone?: string
  theme?: 'light' | 'dark' | 'auto'
  currency?: string
  notifications?: NotificationsPref
  privacySettings?: { profileVisibility?: 'public' | 'friends' | 'private'; showEmail?: boolean; showLocation?: boolean }
}

export default function ProfileCard({ initialName = 'Alex Traveler', initialEmail = 'alex@example.com', initialAvatarUrl }: ProfileCardProps) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatarUrl)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  // Saved destinations
  const [destinations, setDestinations] = useState<SavedDestination[]>([])
  const [newDest, setNewDest] = useState<SavedDestination>({ name: '', city: '', country: '', notes: '' })
  const [addingDest, setAddingDest] = useState(false)

  // Preferences
  const [prefs, setPrefs] = useState<Preferences>({ theme: 'light', notifications: { email: true, push: true, marketing: false } })
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Load profile from backend
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    apiFetch('/profile')
      .then((res) => {
        if (!mounted) return
        const u = res.data || res // tolerate either shape
        if (u) {
          setName(u.name ?? initialName)
          setEmail(u.email ?? initialEmail)
          if (u.avatar) setAvatarUrl(u.avatar)
          if (Array.isArray(u.savedDestinations)) setDestinations(u.savedDestinations)
          setPrefs({
            language: u.language,
            timezone: u.timezone,
            theme: u.theme || 'light',
            currency: u.currency,
            notifications: u.notifications || { email: true, push: true, marketing: false },
            privacySettings: u.privacySettings
          })
        }
      })
      .catch((e) => {
        setError(e.message || 'Failed to load profile')
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

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
    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
  }

  async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function onSave() {
    setError(null)
    if (!isValid) {
      setError('Please provide a valid name and email.')
      return
    }
    try {
      setSaving(true)
      let avatar = avatarUrl
      if (avatarFile) {
        // Convert to base64 data URL to persist in backend avatar string
        avatar = await fileToDataUrl(avatarFile)
      }

      const body: Record<string, unknown> = { name, email }
      if (avatar) body.avatar = avatar

      const res = await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(body)
      })

      // Apply returned values (in case backend normalized)
      const updated = res.data || res
      setName(updated.name ?? name)
      setEmail(updated.email ?? email)
      if (updated.avatar) setAvatarUrl(updated.avatar)

      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (e: any) {
      setError(e.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  async function onAddDestination() {
    if (!newDest.name || !newDest.city || !newDest.country) return
    try {
      setAddingDest(true)
      const res = await apiFetch('/profile/saved-destinations', {
        method: 'POST',
        body: JSON.stringify(newDest)
      })
      const added = res.data || res
      setDestinations((d) => [added, ...d])
      setNewDest({ name: '', city: '', country: '', notes: '' })
    } catch (e: any) {
      setError(e.message || 'Failed to add destination')
    } finally {
      setAddingDest(false)
    }
  }

  async function onRemoveDestination(id?: string) {
    if (!id) return
    try {
      await apiFetch(`/profile/saved-destinations/${id}`, { method: 'DELETE' })
      setDestinations((d) => d.filter((x) => x._id !== id))
    } catch (e: any) {
      setError(e.message || 'Failed to remove destination')
    }
  }

  async function onSavePreferences() {
    try {
      setSavingPrefs(true)
      await apiFetch('/profile/preferences', { method: 'PUT', body: JSON.stringify(prefs) })
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    } catch (e: any) {
      setError(e.message || 'Failed to save preferences')
    } finally {
      setSavingPrefs(false)
    }
  }

  async function onDeleteAccount() {
    if (!deletePassword) {
      setError('Please enter your password to confirm deletion.')
      return
    }
    try {
      setDeleting(true)
      await apiFetch('/profile', { method: 'DELETE', body: JSON.stringify({ password: deletePassword }) })
      // Clear token and reload to auth screen
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    } catch (e: any) {
      setError(e.message || 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">Profile</h2>
        {loading && <span className="text-xs text-neutral-500">Loading…</span>}
      </div>

      {/* Basic profile */}
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
          disabled={saving || loading}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Saved Destinations */}
      <div className="mt-10">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><Globe className="h-4 w-4" /> Saved Destinations</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {destinations.length === 0 && (
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">No saved destinations yet.</div>
          )}
          {destinations.map((d) => (
            <div key={d._id || `${d.name}-${d.city}-${d.country}`} className="flex items-start justify-between rounded-md border border-neutral-200 bg-white p-3 text-sm">
              <div>
                <div className="font-medium text-neutral-900">{d.name}</div>
                <div className="text-xs text-neutral-600">{d.city}, {d.country}</div>
                {d.notes && <div className="mt-1 text-xs text-neutral-600">{d.notes}</div>}
              </div>
              {d._id && (
                <button className="inline-flex items-center rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50" onClick={() => onRemoveDestination(d._id)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <input className="rounded-md border-none bg-white px-3 py-2 text-sm text-neutral-900 ring-1 ring-neutral-200 focus:ring-2 focus:ring-blue-500" placeholder="Name" value={newDest.name} onChange={(e) => setNewDest({ ...newDest, name: e.target.value })} />
            <input className="rounded-md border-none bg-white px-3 py-2 text-sm text-neutral-900 ring-1 ring-neutral-200 focus:ring-2 focus:ring-blue-500" placeholder="City" value={newDest.city} onChange={(e) => setNewDest({ ...newDest, city: e.target.value })} />
            <input className="rounded-md border-none bg-white px-3 py-2 text-sm text-neutral-900 ring-1 ring-neutral-200 focus:ring-2 focus:ring-blue-500" placeholder="Country" value={newDest.country} onChange={(e) => setNewDest({ ...newDest, country: e.target.value })} />
          </div>
          <textarea className="mt-2 w-full rounded-md border-none bg-white px-3 py-2 text-sm text-neutral-900 ring-1 ring-neutral-200 focus:ring-2 focus:ring-blue-500" placeholder="Notes (optional)" value={newDest.notes} onChange={(e) => setNewDest({ ...newDest, notes: e.target.value })} />
          <button type="button" onClick={onAddDestination} disabled={addingDest || !newDest.name || !newDest.city || !newDest.country} className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            <Plus className="mr-1 h-3.5 w-3.5" /> {addingDest ? 'Adding…' : 'Add Destination'}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="mt-10">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><Settings className="h-4 w-4" /> Preferences</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-neutral-200 bg-white p-3 text-sm">
            <label className="mb-1 block text-xs font-medium text-neutral-700">Theme</label>
            <select className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm ring-1 ring-neutral-200 focus:ring-2 focus:ring-blue-500" value={prefs.theme} onChange={(e) => setPrefs((p) => ({ ...p, theme: e.target.value as any }))}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-3 text-sm">
            <label className="mb-2 block text-xs font-medium text-neutral-700">Notifications</label>
            <label className="mb-1 flex items-center gap-2 text-xs"><input type="checkbox" checked={!!prefs.notifications?.email} onChange={(e) => setPrefs((p) => ({ ...p, notifications: { ...p.notifications, email: e.target.checked } }))} /> Email</label>
            <label className="mb-1 flex items-center gap-2 text-xs"><input type="checkbox" checked={!!prefs.notifications?.push} onChange={(e) => setPrefs((p) => ({ ...p, notifications: { ...p.notifications, push: e.target.checked } }))} /> Push</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!prefs.notifications?.marketing} onChange={(e) => setPrefs((p) => ({ ...p, notifications: { ...p.notifications, marketing: e.target.checked } }))} /> Marketing</label>
          </div>
        </div>
        <button type="button" onClick={onSavePreferences} disabled={savingPrefs} className="mt-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60">{savingPrefs ? 'Saving…' : 'Save Preferences'}</button>
      </div>

      {/* Account Management */}
      <div className="mt-10">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><Shield className="h-4 w-4" /> Account Management</h3>
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
          <p className="mb-2 text-xs text-red-700">Danger zone: Deleting your account is permanent.</p>
          <input type="password" placeholder="Confirm password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="mb-2 w-full rounded-md border-none bg-white px-3 py-2 text-sm text-neutral-900 ring-1 ring-neutral-200 focus:ring-2 focus:ring-red-500" />
          <button type="button" onClick={onDeleteAccount} disabled={deleting || !deletePassword} className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60">{deleting ? 'Deleting…' : 'Delete Account'}</button>
        </div>
      </div>
    </section>
  )
}


