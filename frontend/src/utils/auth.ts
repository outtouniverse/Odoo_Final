import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Role = 'super_admin' | 'moderator' | 'support'

export type AuthUser = {
    id: string
    name: string
    email: string
    role: Role
    token: string
}

type AuthContextValue = {
    user: AuthUser | null
    isAuthenticated: boolean
    login: (user: Omit<AuthUser, 'id'>) => void
    logout: () => void
    hasRole: (roles: Role | Role[]) => boolean
}

const STORAGE_KEY = 'globetrotter.auth'

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
    return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) return null
            const parsed = JSON.parse(raw) as AuthUser
            return parsed?.token ? parsed : null
        } catch {
            return null
        }
    })

    useEffect(() => {
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        else localStorage.removeItem(STORAGE_KEY)
    }, [user])

    const login = useCallback((payload: Omit<AuthUser, 'id'>) => {
        const newUser: AuthUser = {
            id: crypto.randomUUID(),
            ...payload,
        }
        setUser(newUser)
    }, [])

    const logout = useCallback(() => setUser(null), [])

    const hasRole = useCallback(
        (roles: Role | Role[]) => {
            if (!user) return false
            const required = Array.isArray(roles) ? roles : [roles]
            return required.includes(user.role)
        },
        [user]
    )

    const value = useMemo(
        () => ({ user, isAuthenticated: Boolean(user), login, logout, hasRole }),
        [user, login, logout, hasRole]
    )

    return <AuthContext.Provider value={ value }> { children } </AuthContext.Provider>
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated) return null
    return <>{ children } </>
}

export function RequireRole({ allow, children }: { allow: Role | Role[]; children: React.ReactNode }) {
    const { hasRole } = useAuth()
    if (!hasRole(allow)) return null
    return <>{ children } </>
}


