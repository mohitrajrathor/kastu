import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders kastu wordmark and primary cta', () => {
    render(<App />)
    expect(screen.getByText('kastu')).toBeInTheDocument()
    expect(screen.getByText('Find your voice with confidence')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })
})
