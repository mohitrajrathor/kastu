import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

describe('Auth and Dashboard Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders landing screen for unauthenticated users', () => {
    render(<App />)
    expect(screen.getByText('kastu')).toBeInTheDocument()
    expect(screen.getByText('Find your voice with confidence')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('opens auth modal when clicking Sign In or Get Started', async () => {
    render(<App />)
    const getStartedBtn = screen.getByText('Get Started')
    fireEvent.click(getStartedBtn)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
  })

  it('allows toggling between login and registration in auth modal', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('Get Started'))
    expect(screen.getByText('Welcome back')).toBeInTheDocument()

    const switchBtn = screen.getByText('Register now')
    fireEvent.click(switchBtn)
    expect(screen.getByText('Start your journey')).toBeInTheDocument()
    expect(screen.getByText('Create Account')).toBeInTheDocument()
  })
})
