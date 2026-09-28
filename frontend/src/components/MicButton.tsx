import { useEffect } from 'react'
import { Mic, Square } from 'lucide-react'

interface MicButtonProps {
  isRecording: boolean
  disabled?: boolean
  onClick: () => void
}

export function MicButton({ isRecording, disabled = false, onClick }: MicButtonProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle recording with spacebar if not focused on an input/textarea
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        if (!disabled) {
          onClick()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, onClick])

  return (
    <div className="relative inline-flex items-center justify-center">
      {isRecording && (
        <span
          className="absolute -inset-3 rounded-full animate-ping opacity-30 bg-[#1A8C7A]"
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={isRecording ? 'Stop speaking' : 'Start speaking'}
        className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-[#D95F3B] hover:bg-[#C24E2C] text-white shadow-[0_4px_0_0_#9E381B] active:translate-y-1 active:shadow-none'
            : 'bg-[#1A8C7A] hover:bg-[#1E9E8A] text-white shadow-[0_4px_0_0_#136B5C] active:translate-y-1 active:shadow-none'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isRecording ? (
          <Square className="w-8 h-8" strokeWidth={2.5} />
        ) : (
          <Mic className="w-8 h-8" strokeWidth={2.5} />
        )}
      </button>
    </div>
  )
}
