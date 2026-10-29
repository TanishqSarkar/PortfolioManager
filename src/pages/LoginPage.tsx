import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, LineChart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Mode = 'signin' | 'signup' | 'forgot'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (mode === 'forgot') {
      if (!email) {
        setError('Enter the email associated with your account.')
        return
      }
      setSubmitting(true)
      const result = await resetPassword(email)
      setSubmitting(false)
      if (result.error) {
        setError(result.error)
        return
      }
      setInfo('If an account exists for that email, a password reset link has been sent.')
      return
    }

    setSubmitting(true)
    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, name)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setInfo('Account created! Check your inbox and confirm your email address, then sign in.')
      setMode('signin')
      return
    }
    navigate('/portfolios')
  }

  return (
    <div className="relative min-h-[calc(100vh-30px)] flex items-center justify-center overflow-hidden bg-base-950 px-4">
      {/* Subtle financial market background elements */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points="0,320 60,300 120,340 180,260 240,280 300,200 360,230 420,170 480,190 540,120 600,150 660,90 720,110 800,60"
            fill="none"
            stroke="#3fb97f"
            strokeWidth="2"
          />
          <polyline
            points="0,250 60,260 120,230 180,270 240,240 300,290 360,260 420,300 480,270 540,310 600,280 660,320 720,290 800,330"
            fill="none"
            stroke="#4f8cff"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-navy-800 border border-base-700 px-4 py-2.5">
            <LineChart className="text-accent" size={24} />
            <span className="text-lg font-bold tracking-tight">NSE Portfolio</span>
          </div>
          <p className="text-sm text-gray-500">Institutional-grade portfolio tracking</p>
        </div>

        <div className="rounded-2xl border border-base-700 bg-navy-900/80 backdrop-blur-sm p-7 shadow-card">
          <div className="mb-6 flex gap-1 rounded-lg bg-base-800 p-1">
            <button
              onClick={() => { setMode('signin'); setError(''); setInfo('') }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === 'signin' ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setInfo('') }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'forgot' ? (
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Reset your password</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter your email and we'll send you a reset link.
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {mode === 'signin'
                  ? 'Sign in to access your portfolios.'
                  : 'Track your NSE investments in one place.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full rounded-lg border border-base-600 bg-base-800 py-2.5 pl-9 pr-3 text-sm text-gray-100 outline-none transition-colors focus:border-accent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-base-600 bg-base-800 py-2.5 pl-9 pr-3 text-sm text-gray-100 outline-none transition-colors focus:border-accent"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-medium text-gray-400">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setInfo('') }}
                      className="text-xs text-accent hover:text-accent-dim"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-base-600 bg-base-800 py-2.5 pl-9 pr-9 text-sm text-gray-100 outline-none transition-colors focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-loss/30 bg-loss-bg px-3 py-2 text-xs text-loss">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dim disabled:opacity-60"
            >
              {submitting ? (
                'Please wait…'
              ) : mode === 'signin' ? (
                <>
                  <TrendingUp size={16} /> Sign In
                </>
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Send Reset Link'
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setInfo('') }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-200"
              >
                Back to sign in
              </button>
            )}
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-600">
          Accounts are real and stored in Supabase. Your portfolios are private to your account.
        </p>
      </div>
    </div>
  )
}
