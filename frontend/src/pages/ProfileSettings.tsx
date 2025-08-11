import React from 'react'
import Header from '../components/Header'
import ProfileCard from '../components/ProfileCard'
import SettingsPanel from '../components/SettingsPanel'

export default function ProfileSettings() {
    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
            <Header />
            <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Profile & Settings</h1>
                    <p className="mt-1 text-sm text-neutral-600">Manage your profile and preferences.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
                    <ProfileCard />
                    <SettingsPanel />
                </div>
            </main>
        </div>
    )
}


