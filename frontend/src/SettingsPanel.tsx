import React from 'react'
import Preferences from './Preferences'
import SavedDestinations from './SavedDestinations'
import AccountManagement from './AccountManagement'

export default function SettingsPanel() {
  return (
    <div className="space-y-6">
      <Preferences />
      <SavedDestinations />
      <AccountManagement />
    </div>
  )
}


