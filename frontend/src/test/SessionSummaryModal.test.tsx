import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionSummaryModal } from '../components/SessionSummaryModal'
import type { GrammarCorrection } from '../types'

describe('SessionSummaryModal Component', () => {
  const mockCorrections: GrammarCorrection[] = [
    {
      original: 'I am go to market',
      corrected: 'I am going to the market',
      error_type: 'verb_form',
      explanation: 'Use going'
    }
  ]

  it('renders stats, corrections, and calls onClose on button click', () => {
    const onClose = vi.fn()
    render(
      <SessionSummaryModal
        isOpen={true}
        durationSeconds={125}
        turnCount={4}
        corrections={mockCorrections}
        onClose={onClose}
      />
    )

    expect(screen.getByText('Session Completed!')).toBeInTheDocument()
    expect(screen.getByText('2m 5s')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText(/I am go to market/i)).toBeInTheDocument()
    expect(screen.getByText(/I am going to the market/i)).toBeInTheDocument()

    const btn = screen.getByText('Back to Topics')
    fireEvent.click(btn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SessionSummaryModal
        isOpen={false}
        durationSeconds={120}
        turnCount={2}
        corrections={[]}
        onClose={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
