import { useState, useEffect } from 'react'
import type { User, Topic } from './types'
import { fetchCurrentUser, clearToken, getToken } from './lib/api'
import { AuthModal } from './components/AuthModal'
import { Dashboard } from './components/Dashboard'
import { VoiceSession } from './components/VoiceSession'
import { Mic, Sparkles, LogOut, User as UserIcon } from 'lucide-react'

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      fetchCurrentUser()
        .then((u) => setUser(u))
        .catch(() => clearToken())
        .finally(() => setIsCheckingAuth(false))
    } else {
      setIsCheckingAuth(false)
    }
  }, [])

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setSelectedTopic(null)
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center font-sans font-medium text-[#1A8C7A] animate-pulse">
          Loading Kastu...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-body">
      {/* Header */}
      <header className="border-b border-[#E0DAD2] bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="kastu-wordmark text-3xl font-display font-normal">kastu</span>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E6F5F2] text-[#1A8C7A]">
            Voice Practice
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2EFE9] text-xs font-medium text-[#5C5C5C]">
                <UserIcon className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0DAD2] hover:bg-gray-50 text-xs font-medium text-[#5C5C5C] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-semibold text-white flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FEF3DC]" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {user ? (
          selectedTopic ? (
            <VoiceSession
              user={user}
              topic={selectedTopic}
              onEndSession={() => setSelectedTopic(null)}
            />
          ) : (
            <Dashboard
              user={user}
              onSelectTopic={(topic) => setSelectedTopic(topic)}
            />
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto">
            <div className="w-16 h-16 rounded-full bg-[#E6F5F2] text-[#1A8C7A] flex items-center justify-center mb-6 shadow-sm">
              <Mic className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-sans tracking-tight mb-3">
              Find your voice with confidence
            </h1>
            <p className="text-base text-[#5C5C5C] font-body mb-8 max-w-lg">
              Practice speaking English with a patient AI partner. Converse naturally while real-time, non-blocking grammar guidance appears on screen.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-primary px-8 py-3.5 rounded-xl font-sans font-semibold text-white flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-[#FEF3DC]" />
              <span>Get Started</span>
            </button>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => setUser(u)}
      />
    </div>
  )
}

export default App
