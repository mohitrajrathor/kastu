import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VoiceSession } from '../components/VoiceSession'
import type { Topic, User } from '../types'

describe('VoiceSession Component', () => {
  const mockUser: User = { userId: 'u-123', email: 'learner@example.com' }
  const mockTopic: Topic = {
    id: 'daily-life',
    title: 'Daily Life & Routines',
    description: 'Talk about your day',
    difficulty: 'Beginner',
    promptContext: 'Daily routines context'
  }

  beforeEach(() => {
    // Mock WebSocket
    class MockWebSocket {
      onopen: any = null
      onmessage: any = null
      onerror: any = null
      onclose: any = null
      readyState = 1
      send = vi.fn()
      close = vi.fn()
    }
    vi.stubGlobal('WebSocket', MockWebSocket)
  })

  it('renders topic title and voice control elements', () => {
    render(
      <VoiceSession
        user={mockUser}
        topic={mockTopic}
        onEndSession={vi.fn()}
      />
    )

    expect(screen.getByText('Daily Life & Routines')).toBeInTheDocument()
    expect(screen.getByText('Beginner Practice')).toBeInTheDocument()
    expect(screen.getByText('End Session')).toBeInTheDocument()
    expect(screen.getByLabelText('Start speaking')).toBeInTheDocument()
    expect(screen.getByText(/Ready \(Press Mic or Spacebar\)/i)).toBeInTheDocument()
  })
})
