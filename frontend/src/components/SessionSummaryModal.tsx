import { CheckCircle2, Clock, MessageSquare, Sparkles, Trophy } from 'lucide-react'
import type { GrammarCorrection } from '../types'

interface SessionSummaryModalProps {
  isOpen: boolean
  durationSeconds: number
  turnCount: number
  corrections: GrammarCorrection[]
  onClose: () => void
}

export function SessionSummaryModal({
  isOpen,
  durationSeconds,
  turnCount,
  corrections,
  onClose
}: SessionSummaryModalProps) {
  if (!isOpen) return null

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  const timeFormatted = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E0DAD2] text-center">
        {/* Trophy Header */}
        <div className="w-16 h-16 rounded-full bg-[#FEF6E4] text-[#B87D12] mx-auto flex items-center justify-center mb-4 shadow-sm border border-[#F5A623]/30">
          <Trophy className="w-8 h-8 text-[#E8A020]" />
        </div>

        <h2 className="text-2xl font-bold font-sans text-[#1A1A1A]">
          Session Completed!
        </h2>
        <p className="text-sm text-[#5C5C5C] font-body mt-1 mb-6">
          Great job speaking today. Practice makes progress!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E0DAD2]">
            <Clock className="w-4 h-4 text-[#1A8C7A] mx-auto mb-1" />
            <div className="text-lg font-bold font-display text-[#1A1A1A]">{timeFormatted}</div>
            <div className="text-[10px] uppercase font-semibold text-[#8C8C8C]">Duration</div>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E0DAD2]">
            <MessageSquare className="w-4 h-4 text-[#1A8C7A] mx-auto mb-1" />
            <div className="text-lg font-bold font-display text-[#1A1A1A]">{turnCount}</div>
            <div className="text-[10px] uppercase font-semibold text-[#8C8C8C]">Turns</div>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E0DAD2]">
            <Sparkles className="w-4 h-4 text-[#E8A020] mx-auto mb-1" />
            <div className="text-lg font-bold font-display text-[#1A1A1A]">{corrections.length}</div>
            <div className="text-[10px] uppercase font-semibold text-[#8C8C8C]">Tips Given</div>
          </div>
        </div>

        {/* Grammar highlights if any */}
        {corrections.length > 0 && (
          <div className="text-left mb-6 p-4 bg-[#FAF8F5] rounded-2xl border border-[#E0DAD2]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C5C5C] mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1A8C7A]" />
              Key Self-Corrections
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {corrections.map((c, i) => (
                <div key={i} className="text-xs font-body">
                  <span className="text-[#8C8C8C] line-through mr-1">{c.original}</span>
                  <span className="font-semibold text-[#136B5C]">→ {c.corrected}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full btn-primary py-3.5 rounded-xl font-sans font-semibold text-white flex items-center justify-center gap-2"
        >
          <span>Back to Topics</span>
        </button>
      </div>
    </div>
  )
}
