import React, { useMemo, useState } from 'react'
import { Link, useRouter } from './router'
import { apiFetch } from './api'

type AuthMode = 'login' | 'register' | 'forgot'

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const [forgotEmail, setForgotEmail] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const title = useMemo(() => {
    if (mode === 'login') return 'Welcome back'
    if (mode === 'register') return 'Create your account'
    return 'Reset your password'
  }, [mode])

  function validateEmail(email: string) {
    return /.+@.+\..+/.test(email)
  }

  async function onSubmitLogin(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (!validateEmail(loginEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (loginPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      // Backend returns data.data.accessToken
      localStorage.setItem('accessToken', data.data.accessToken)
      setMessage('Logged in. Redirecting…')
      setTimeout(() => router.navigate('/dashboard'), 450)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  async function onSubmitRegister(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (regName.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (!validateEmail(regEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword })
      })
      localStorage.setItem('accessToken', data.data.accessToken)
      setMessage('Account created. Redirecting…')
      setTimeout(() => router.navigate('/dashboard'), 450)
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    }
  }

  async function onSubmitForgot(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (!validateEmail(forgotEmail)) {
      setError('Enter a valid email address.')
      return
    }
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail })
      })
      setMessage('Password reset link sent. Check your inbox.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="text-base font-semibold tracking-tight text-neutral-900">GlobeTrotter</Link>
            <nav className="hidden items-center gap-8 text-sm text-neutral-700 md:flex" aria-label="Primary">
              <a href="#features" className="hover:text-neutral-900">Features</a>
              <a href="#how" className="hover:text-neutral-900">How It Works</a>
              <a href="#demo" className="hover:text-neutral-900">Demo</a>
            </nav>
            <Link to="/" className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50">Back to Home</Link>
          </div>
        </div>
      </header>

      {/* Auth Card */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mt-10 max-w-md">
          <div className="mb-6 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
            <div className="grid grid-cols-3 text-sm font-medium text-neutral-700">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-full px-3 py-2 transition ${mode === 'login' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-neutral-50'}`}
                aria-pressed={mode === 'login'}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-full px-3 py-2 transition ${mode === 'register' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-neutral-50'}`}
                aria-pressed={mode === 'register'}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className={`rounded-full px-3 py-2 transition ${mode === 'forgot' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-neutral-50'}`}
                aria-pressed={mode === 'forgot'}
              >
                Forgot
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {mode === 'login' && 'Sign in to access your itineraries and keep planning.'}
              {mode === 'register' && 'Set up your GlobeTrotter account to start building trips.'}
              {mode === 'forgot' && 'We’ll email you a link to reset your password.'}
            </p>

            {message && (
              <div className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={onSubmitLogin} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-neutral-800">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-neutral-800">Password</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-teal-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-2 my-auto inline-flex h-8 items-center rounded px-2 text-xs text-neutral-600 hover:bg-neutral-100"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <input id="remember" type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-teal-600 focus:ring-teal-500" />
                    <label htmlFor="remember" className="text-xs text-neutral-700">Remember me</label>
                  </div>
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-neutral-700 hover:text-neutral-900">Forgot password?</button>
                </div>
                <div className="pt-2">
                  <button type="submit" className="inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">Sign In</button>
                </div>
                <p className="text-center text-xs text-neutral-600">
                  New here?{' '}
                  <button type="button" onClick={() => setMode('register')} className="font-medium text-neutral-800 underline-offset-2 hover:underline">Create an account</button>
                </p>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={onSubmitRegister} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="reg-name" className="mb-1 block text-sm font-medium text-neutral-800">Full name</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    placeholder="Alex Traveler"
                  />
                </div>
                <div>
                  <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-neutral-800">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-neutral-800">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    placeholder="Create a password"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">Create Account</button>
                </div>
                <p className="text-center text-xs text-neutral-600">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode('login')} className="font-medium text-neutral-800 underline-offset-2 hover:underline">Sign in</button>
                </p>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={onSubmitForgot} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-neutral-800">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full rounded-md border-none bg-neutral-50 px-3 py-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-200 transition placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="inline-flex w-full items-center justify-center rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">Send Reset Link</button>
                </div>
                <p className="text-center text-xs text-neutral-600">
                  Remembered your password?{' '}
                  <button type="button" onClick={() => setMode('login')} className="font-medium text-neutral-800 underline-offset-2 hover:underline">Back to sign in</button>
                </p>
              </form>
            )}
          </div>

          <p className="mx-auto max-w-md px-2 py-6 text-center text-[11px] leading-relaxed text-neutral-500">
            By continuing, you agree to GlobeTrotter’s Terms and acknowledge our Privacy Policy.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">About</h4>
              <p className="mt-2 text-sm text-neutral-600">Plan multi-city trips, collaborate with friends, and keep your budget in view.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Links</h4>
              <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                <li><a href="#features" className="hover:text-neutral-900">Features</a></li>
                <li><a href="#how" className="hover:text-neutral-900">How It Works</a></li>
                <li><a href="#demo" className="hover:text-neutral-900">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Social</h4>
              <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                <li><a href="#" className="hover:text-neutral-900">Twitter</a></li>
                <li><a href="#" className="hover:text-neutral-900">Instagram</a></li>
                <li><a href="#" className="hover:text-neutral-900">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-neutral-200 pt-5 text-center text-xs text-neutral-500">© {new Date().getFullYear()} GlobeTrotter. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}


