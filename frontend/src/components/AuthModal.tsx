import { useState } from 'react'
import { registerUser, loginUser, setToken } from '../lib/api'
import type { User } from '../types'
import { AlertCircle, Lock, Mail, Sparkles, X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User) => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('dev@kastu.ai')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const resp = isLogin
        ? await loginUser(email, password)
        : await registerUser(email, password)

      setToken(resp.token)
      onSuccess({ userId: resp.userId, email })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Authentication error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E0DAD2] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <span className="kastu-wordmark text-3xl font-display">kastu</span>
          <h2 className="text-xl font-bold font-sans mt-2">
            {isLogin ? 'Welcome back' : 'Start your journey'}
          </h2>
          <p className="text-sm text-[#5C5C5C] font-body mt-1">
            {isLogin ? 'Sign in to continue your voice practice' : 'Create an account to track your progress'}
          </p>
        </div>

        {/* Developer Testing Preset */}
        <div className="mb-4 p-2.5 bg-[#E6F5F2] border border-[#1A8C7A]/25 rounded-xl flex items-center justify-between text-xs font-body">
          <div className="text-[#1A8C7A]">
            <span className="font-semibold">Dev Preset:</span> dev@kastu.ai
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('dev@kastu.ai')
              setPassword('Password123!')
            }}
            className="text-[#1A8C7A] font-bold hover:underline cursor-pointer"
          >
            Auto-fill
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FDEEE9] border border-[#D95F3B]/30 rounded-xl flex items-center gap-2 text-sm text-[#D95F3B]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E0DAD2] focus:outline-none focus:border-[#1A8C7A] text-sm font-body bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E0DAD2] focus:outline-none focus:border-[#1A8C7A] text-sm font-body bg-[#FAF8F5]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 rounded-xl font-sans font-semibold text-white flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FEF3DC]" />
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[#5C5C5C]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
            }}
            className="font-semibold text-[#1A8C7A] hover:underline"
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
