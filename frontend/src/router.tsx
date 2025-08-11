import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type RouterContextValue = {
    path: string
    navigate: (to: string, options?: { replace?: boolean }) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

export function useRouter() {
    const ctx = useContext(RouterContext)
    if (!ctx) throw new Error('useRouter must be used within <RouterProvider>')
    return ctx
}

export function Link({ to, className, children, onClick, ...rest }: React.ComponentProps<'a'> & { to: string }) {
    const { navigate } = useRouter()
    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
            href={to}
            className={className}
            onClick={(e) => {
                if (onClick) onClick(e)
                if (e.defaultPrevented) return
                const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0
                if (isModified) return
                e.preventDefault()
                navigate(to)
            }}
            {...rest}
        >
            {children}
        </a>
    )
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
    const [path, setPath] = useState(() => window.location.pathname + window.location.hash)

    useEffect(() => {
        const onPop = () => setPath(window.location.pathname + window.location.hash)
        window.addEventListener('popstate', onPop)
        return () => window.removeEventListener('popstate', onPop)
    }, [])

    const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
        if (options?.replace) {
            window.history.replaceState(null, '', to)
        } else {
            window.history.pushState(null, '', to)
        }
        setPath(window.location.pathname + window.location.hash)
    }, [])

    const value = useMemo(() => ({ path, navigate }), [path, navigate])
    return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function Routes({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

export function Route({ path, element }: { path: string; element: React.ReactNode }) {
    const { path: current } = useRouter()
    if (matchPath(path, current)) {
        return <>{element}</>
    }
    return null
}

function matchPath(routePath: string, currentPath: string) {
    // Exact match only for now; supports hash fragment if included in currentPath
    return routePath === currentPath.replace(/#.*$/, '')
}


