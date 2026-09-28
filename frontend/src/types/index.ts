export interface User {
  userId: string
  email: string
}

export interface Topic {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  promptContext: string
}

export interface GrammarCorrection {
  original: string
  corrected: string
  error_type: string
  explanation: string
}

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING'

export interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  text: string
  timestamp: string
}
