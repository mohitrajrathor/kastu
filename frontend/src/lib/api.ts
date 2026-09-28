import type { User, Topic } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || ''

export function getToken(): string | null {
  return localStorage.getItem('kastu_token')
}

export function setToken(token: string) {
  localStorage.setItem('kastu_token', token)
}

export function clearToken() {
  localStorage.removeItem('kastu_token')
}

export async function registerUser(email: string, password: string): Promise<{ userId: string; token: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Registration failed')
  }
  return res.json()
}

export async function loginUser(email: string, password: string): Promise<{ userId: string; token: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Invalid credentials')
  }
  return res.json()
}

export async function fetchCurrentUser(): Promise<User> {
  const token = getToken()
  if (!token) throw new Error('No token found')
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Unauthorized')
  return res.json()
}

export async function fetchTopics(): Promise<Topic[]> {
  const res = await fetch(`${BASE_URL}/api/topics`)
  if (!res.ok) throw new Error('Failed to load topics')
  return res.json()
}
