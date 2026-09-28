import { useEffect, useRef } from 'react'

interface AudioWaveformProps {
  isRecording: boolean
  isAgentSpeaking?: boolean
  stream: MediaStream | null
  barCount?: number
}

export function AudioWaveform({
  isRecording,
  isAgentSpeaking = false,
  stream,
  barCount = 24
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1. Microphone recording active: Visualize live audio stream
    if (isRecording && stream) {
      let audioContext: AudioContext | null = null
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        audioContext = new AudioCtx()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 64
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const render = () => {
          if (!canvas || !ctx) return
          analyser.getByteFrequencyData(dataArray)
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          const barWidth = canvas.width / barCount
          for (let i = 0; i < barCount; i++) {
            const index = Math.floor((i / barCount) * bufferLength)
            const value = dataArray[index] || 10
            const barHeight = Math.max(4, (value / 255) * (canvas.height - 8))
            const x = i * barWidth + 2
            const y = (canvas.height - barHeight) / 2

            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
            gradient.addColorStop(0, '#1A8C7A')
            gradient.addColorStop(1, '#2DBD8F')

            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.roundRect(x, y, barWidth - 4, barHeight, 4)
            ctx.fill()
          }
          animationFrameId.current = requestAnimationFrame(render)
        }
        render()
      } catch (e) {
        console.error('AudioContext error', e)
      }

      return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
        if (audioContext && audioContext.state !== 'closed') audioContext.close().catch(() => {})
      }
    }

    // 2. Agent Speaking active: Visualize smooth animated gold/teal wave
    if (isAgentSpeaking) {
      let phase = 0
      const renderAgentWave = () => {
        if (!canvas || !ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        phase += 0.08

        const barWidth = canvas.width / barCount
        for (let i = 0; i < barCount; i++) {
          const sinVal = Math.sin(phase + (i * 0.4))
          const barHeight = Math.max(6, Math.abs(sinVal) * (canvas.height - 16) + 8)
          const x = i * barWidth + 2
          const y = (canvas.height - barHeight) / 2

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
          gradient.addColorStop(0, '#E8A020') // Kasturi Gold
          gradient.addColorStop(1, '#1A8C7A') // Kasturi Teal

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth - 4, barHeight, 4)
          ctx.fill()
        }
        animationFrameId.current = requestAnimationFrame(renderAgentWave)
      }
      renderAgentWave()

      return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
      }
    }

    // 3. Idle Baseline
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#E0DAD2'
    const barWidth = canvas.width / barCount
    for (let i = 0; i < barCount; i++) {
      ctx.fillRect(i * barWidth + 2, canvas.height / 2 - 2, barWidth - 4, 4)
    }

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [isRecording, isAgentSpeaking, stream, barCount])

  return (
    <div className="w-full flex items-center justify-center py-4">
      <canvas
        ref={canvasRef}
        width={320}
        height={64}
        className="w-full max-w-xs h-16 rounded-xl bg-white/60 border border-[#E0DAD2]/50 shadow-inner"
        aria-label="Audio waveform visualization"
      />
    </div>
  )
}
