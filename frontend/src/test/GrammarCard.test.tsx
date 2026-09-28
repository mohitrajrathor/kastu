import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GrammarCard } from '../components/GrammarCard'
import type { GrammarCorrection } from '../types'

describe('GrammarCard Component', () => {
  const mockCorrection: GrammarCorrection = {
    original: 'I am go to store',
    corrected: 'I am going to the store',
    error_type: 'verb_form',
    explanation: "Use present continuous 'going' and the article 'the'."
  }

  it('renders original, corrected, explanation, and error type badge', () => {
    const onDismiss = vi.fn()
    render(<GrammarCard correction={mockCorrection} onDismiss={onDismiss} />)

    expect(screen.getByText('I am go to store')).toBeInTheDocument()
    expect(screen.getByText('I am going to the store')).toBeInTheDocument()
    expect(screen.getByText(/Use present continuous 'going'/i)).toBeInTheDocument()
    expect(screen.getByText('verb form')).toBeInTheDocument()
  })

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn()
    render(<GrammarCard correction={mockCorrection} onDismiss={onDismiss} />)

    const dismissBtn = screen.getByLabelText('Dismiss suggestion')
    fireEvent.click(dismissBtn)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
