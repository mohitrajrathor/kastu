import { useEffect, useState } from 'react'
import type { Topic, User } from '../types'
import { fetchTopics } from '../lib/api'
import { Compass, Flame, MessageSquare, Sparkles } from 'lucide-react'

interface DashboardProps {
  user: User
  onSelectTopic: (topic: Topic) => void
}

export function Dashboard({ user, onSelectTopic }: DashboardProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTopics()
      .then((data) => setTopics(data))
      .catch((err) => console.error('Failed to load topics', err))
      .finally(() => setIsLoading(false))
  }, [])

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-[#E6FAF4] text-[#136B5C] border border-[#2DBD8F]/30'
      case 'Intermediate':
        return 'bg-[#FEF6E4] text-[#B87D12] border border-[#F5A623]/30'
      case 'Advanced':
        return 'bg-[#FDEEE9] text-[#D95F3B] border border-[#D95F3B]/30'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-[#1A1A1A]">
            Choose a practice topic
          </h1>
          <p className="text-sm sm:text-base text-[#5C5C5C] font-body mt-1">
            Welcome, <span className="font-semibold text-[#1A8C7A]">{user.email}</span>. Pick a subject to converse naturally with Kastu.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start bg-white border border-[#E0DAD2] px-3.5 py-1.5 rounded-full shadow-xs">
          <Flame className="w-4 h-4 text-[#E8A020]" />
          <span className="text-xs font-semibold text-[#1A1A1A]">Daily Practice</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-[#E0DAD2] animate-pulse h-44" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-2xl p-6 border border-[#E0DAD2] hover:border-[#1A8C7A]/50 transition-all flex flex-col justify-between shadow-xs hover:shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getDifficultyBadge(topic.difficulty)}`}>
                    {topic.difficulty}
                  </span>
                  <MessageSquare className="w-4 h-4 text-[#8C8C8C] group-hover:text-[#1A8C7A] transition-colors" />
                </div>
                <h3 className="text-lg font-bold font-sans text-[#1A1A1A] mb-1.5 group-hover:text-[#1A8C7A] transition-colors">
                  {topic.title}
                </h3>
                <p className="text-sm text-[#5C5C5C] font-body line-clamp-2">
                  {topic.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F2EFE9] flex items-center justify-between">
                <span className="text-xs text-[#8C8C8C] flex items-center gap-1 font-body">
                  <Compass className="w-3.5 h-3.5" />
                  Voice Session
                </span>
                <button
                  type="button"
                  onClick={() => onSelectTopic(topic)}
                  className="btn-primary px-4 py-2 rounded-xl text-sm font-sans font-semibold text-white flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FEF3DC]" />
                  <span>Start Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
