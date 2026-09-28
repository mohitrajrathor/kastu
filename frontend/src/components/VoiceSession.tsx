import { useState, useEffect, useRef, useCallback } from 'react'
import type { Topic, User, VoiceState, ChatMessage, GrammarCorrection } from '../types'
import { getToken } from '../lib/api'
import { AudioWaveform } from './AudioWaveform'
import { MicButton } from './MicButton'
import { GrammarCard } from './GrammarCard'
import { SessionSummaryModal } from './SessionSummaryModal'
import { AlertCircle, ArrowLeft, Bot, RefreshCw, Sparkles, Volume2 } from 'lucide-react'

interface VoiceSessionProps {
  user: User
  topic: Topic
  onEndSession: () => void
}

interface SummaryData {
  durationSeconds: number
  turnCount: number
}

export function VoiceSession({ user, topic, onEndSession }: VoiceSessionProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE')
  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [isPartial, setIsPartial] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [micError, setMicError] = useState<string | null>(null)
  const [grammarQueue, setGrammarQueue] = useState<GrammarCorrection[]>([])
  const [allCorrections, setAllCorrections] = useState<GrammarCorrection[]>([])

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const sessionIdRef = useRef<string>(`sess-${Date.now()}`)
  const audioQueueRef = useRef<Blob[]>([])
  const isPlayingAudioRef = useRef<boolean>(false)
  const isIntentionalCloseRef = useRef<boolean>(false)
  const reconnectAttemptsRef = useRef<number>(0)
  const reconnectTimeoutRef = useRef<any>(null)

  const playNextAudioChunk = () => {
    if (isPlayingAudioRef.current || audioQueueRef.current.length === 0) return
    const blob = audioQueueRef.current.shift()
    if (!blob) return

    isPlayingAudioRef.current = true
    const audioUrl = URL.createObjectURL(blob)
    const audio = new Audio(audioUrl)

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      isPlayingAudioRef.current = false
      if (audioQueueRef.current.length > 0) {
        playNextAudioChunk()
      } else {
        setVoiceState('IDLE')
      }
    }

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl)
      isPlayingAudioRef.current = false
      if (audioQueueRef.current.length > 0) {
        playNextAudioChunk()
      } else {
        setVoiceState('IDLE')
      }
    }

    audio.play().catch(() => {
      isPlayingAudioRef.current = false
      if (audioQueueRef.current.length > 0) {
        playNextAudioChunk()
      }
    })
  }

  const connectWebSocket = useCallback(() => {
    const token = getToken()
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws/${user.userId}?token=${token}`

    const ws = new WebSocket(wsUrl)
    ws.binaryType = 'blob'
    wsRef.current = ws

    ws.onopen = () => {
      setIsReconnecting(false)
      reconnectAttemptsRef.current = 0
      ws.send(JSON.stringify({
        type: 'session_start',
        topic: topic.id,
        sessionId: sessionIdRef.current
      }))
    }

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        audioQueueRef.current.push(event.data)
        playNextAudioChunk()
        return
      }

      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'voice_state') {
            setVoiceState(data.state)
          } else if (data.type === 'transcript') {
            setLiveTranscript(data.text)
            setIsPartial(data.isPartial)
            if (!data.isPartial && data.text.trim()) {
              setMessages((prev) => [
                ...prev,
                {
                  id: `user-${Date.now()}`,
                  sender: 'user',
                  text: data.text,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ])
              setLiveTranscript('')
            }
          } else if (data.type === 'agent_text') {
            setMessages((prev) => [
              ...prev,
              {
                id: `agent-${Date.now()}`,
                sender: 'agent',
                text: data.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ])
          } else if (data.type === 'suggestion') {
            if (Array.isArray(data.corrections) && data.corrections.length > 0) {
              setGrammarQueue((prev) => [...prev, ...data.corrections].slice(-3))
              setAllCorrections((prev) => [...prev, ...data.corrections])
            }
          } else if (data.type === 'session_summary') {
            setSummaryData({
              durationSeconds: data.durationSeconds || 60,
              turnCount: data.turnCount || 1
            })
            setIsSummaryOpen(true)
          }
        } catch (e) {
          console.error('Failed to parse WS message', e)
        }
      }
    }

    ws.onclose = () => {
      if (!isIntentionalCloseRef.current) {
        // Attempt reconnection up to 3 times
        if (reconnectAttemptsRef.current < 3) {
          setIsReconnecting(true)
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000
          reconnectAttemptsRef.current += 1
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, delay)
        } else {
          setIsReconnecting(false)
          setMicError('Connection dropped. Please check your network and restart the session.')
        }
      }
    }

    ws.onerror = (e) => {
      console.error('WebSocket error', e)
    }
  }, [user.userId, topic.id])

  useEffect(() => {
    isIntentionalCloseRef.current = false
    connectWebSocket()

    return () => {
      isIntentionalCloseRef.current = true
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
  }, [connectWebSocket])

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
      setIsRecording(false)
      setVoiceState('PROCESSING')
    } else {
      setMicError(null)
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true
          }
        })
        setStream(audioStream)
        setIsRecording(true)
        setVoiceState('LISTENING')

        const mediaRecorder = new MediaRecorder(audioStream)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            e.data.arrayBuffer().then((buffer) => {
              wsRef.current?.send(buffer)
            })
          }
        }

        mediaRecorder.start(250)
      } catch (err: any) {
        setMicError('Microphone permission denied or device not found.')
        setIsRecording(false)
      }
    }
  }

  const handleEndSession = () => {
    isIntentionalCloseRef.current = true
    if (isRecording) {
      if (stream) stream.getTracks().forEach((t) => t.stop())
      setIsRecording(false)
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'session_end',
        sessionId: sessionIdRef.current
      }))
    } else {
      setSummaryData({ durationSeconds: 30, turnCount: messages.filter((m) => m.sender === 'user').length })
      setIsSummaryOpen(true)
    }
  }

  const handleDismissCard = (index: number) => {
    setGrammarQueue((prev) => prev.filter((_, i) => i !== index))
  }

  const getStateBadge = () => {
    if (isReconnecting) {
      return { text: 'Reconnecting...', color: 'bg-[#FEF6E4] text-[#B87D12] border-[#F5A623]/30 animate-pulse' }
    }
    switch (voiceState) {
      case 'LISTENING':
        return { text: 'Listening to you...', color: 'bg-[#E6F5F2] text-[#1A8C7A] border-[#1A8C7A]/30' }
      case 'PROCESSING':
        return { text: 'Agent Thinking...', color: 'bg-[#FEF6E4] text-[#B87D12] border-[#F5A623]/30 animate-pulse' }
      case 'SPEAKING':
        return { text: 'Kastu Speaking...', color: 'bg-[#E6FAF4] text-[#2DBD8F] border-[#2DBD8F]/30 animate-pulse' }
      default:
        return { text: 'Ready (Press Mic or Spacebar)', color: 'bg-white text-[#5C5C5C] border-[#E0DAD2]' }
    }
  }

  const badge = getStateBadge()

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 sm:p-6">
      {/* Session Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E0DAD2] mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleEndSession}
            className="p-2 rounded-xl hover:bg-gray-100 text-[#5C5C5C] transition-colors"
            aria-label="Back to topics"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold font-sans text-[#1A1A1A] leading-tight">
              {topic.title}
            </h2>
            <span className="text-xs text-[#8C8C8C] font-body">{topic.difficulty} Practice</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isReconnecting && (
            <span className="text-xs text-[#E8A020] flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Reconnecting
            </span>
          )}
          <button
            type="button"
            onClick={handleEndSession}
            className="px-4 py-2 rounded-xl border border-[#D95F3B]/30 text-[#D95F3B] hover:bg-[#FDEEE9] text-xs font-semibold font-sans transition-colors cursor-pointer"
          >
            End Session
          </button>
        </div>
      </div>

      {micError && (
        <div className="mb-6 p-4 bg-[#FDEEE9] border border-[#D95F3B]/30 rounded-2xl flex items-start gap-3 text-sm text-[#D95F3B]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{micError}</span>
        </div>
      )}

      {/* Main Content Area: Conversation + Grammar Queue */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Conversation Column */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden bg-white/50 rounded-2xl border border-[#E0DAD2] p-4 min-h-[360px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.length === 0 && !liveTranscript && (
              <div className="h-64 flex flex-col items-center justify-center text-center text-[#8C8C8C]">
                <Bot className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-body">Tap the microphone to speak. Kastu will reply and guide you.</p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-3 text-sm font-body shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#1A8C7A] text-white rounded-br-xs'
                      : 'bg-white text-[#1A1A1A] border border-[#E0DAD2] rounded-bl-xs'
                  }`}
                >
                  {m.sender === 'agent' && (
                    <div className="flex items-center gap-1.5 text-xs text-[#1A8C7A] font-semibold mb-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Kastu Voice</span>
                    </div>
                  )}
                  {m.text}
                </div>
                <span className="text-[10px] text-[#8C8C8C] mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {liveTranscript && (
              <div className="flex flex-col items-end">
                <div className="max-w-md rounded-2xl px-4 py-3 text-sm font-body bg-[#1A8C7A]/80 text-white rounded-br-xs border-2 border-dashed border-[#E8A020] animate-pulse">
                  {liveTranscript} {isPartial && '...'}
                </div>
                <span className="text-[10px] text-[#E8A020] font-semibold mt-1 px-1">Transcribing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Grammar Queue Column */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#E8A020]" />
            <h3 className="text-sm font-bold font-sans text-[#1A1A1A]">Grammar Suggestions</h3>
          </div>

          <div className="space-y-3">
            {!isRecording && grammarQueue.length > 0 ? (
              grammarQueue.map((correction, idx) => (
                <GrammarCard
                  key={`${correction.original}-${idx}`}
                  correction={correction}
                  onDismiss={() => handleDismissCard(idx)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#E0DAD2] p-6 text-center text-xs text-[#8C8C8C] font-body bg-white/30">
                {isRecording
                  ? 'Listening... Suggestions appear after you finish speaking.'
                  : 'No suggestions yet. Speak naturally and helpful corrections will appear here!'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Controls & Waveform */}
      <div className="bg-white rounded-2xl p-6 border border-[#E0DAD2] shadow-sm flex flex-col items-center justify-center">
        <div className={`px-4 py-1.5 rounded-full border text-xs font-semibold mb-3 ${badge.color}`}>
          {badge.text}
        </div>

        <AudioWaveform
          isRecording={isRecording}
          isAgentSpeaking={voiceState === 'SPEAKING'}
          stream={stream}
        />

        <div className="mt-2">
          <MicButton isRecording={isRecording} onClick={toggleRecording} />
        </div>
        <p className="text-xs text-[#8C8C8C] font-body mt-3">
          Press Spacebar or click to {isRecording ? 'finish speaking' : 'speak'}
        </p>
      </div>

      {/* Session Summary Modal */}
      {summaryData && (
        <SessionSummaryModal
          isOpen={isSummaryOpen}
          durationSeconds={summaryData.durationSeconds}
          turnCount={summaryData.turnCount}
          corrections={allCorrections}
          onClose={() => {
            setIsSummaryOpen(false)
            onEndSession()
          }}
        />
      )}
    </div>
  )
}
