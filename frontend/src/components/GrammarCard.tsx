import type { GrammarCorrection } from '../types'
import { CheckCircle2, Sparkles, X } from 'lucide-react'

interface GrammarCardProps {
  correction: GrammarCorrection
  onDismiss: () => void
}

export function GrammarCard({ correction, onDismiss }: GrammarCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-4 border border-[#E0DAD2] shadow-md transition-all hover:shadow-lg relative overflow-hidden"
      role="region"
      aria-label="Grammar suggestion"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF6E4] text-[#B87D12] border border-[#F5A623]/30">
            {correction.error_type.replace('_', ' ')}
          </span>
          <span className="text-xs text-[#8C8C8C] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#E8A020]" />
            Suggestion
          </span>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-[#8C8C8C] hover:text-[#1A1A1A] p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Dismiss suggestion"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 my-2">
        <div className="text-sm text-[#8C8C8C] line-through">
          {correction.original}
        </div>
        <div className="text-sm font-semibold text-[#136B5C] flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#2DBD8F] shrink-0" />
          <span>{correction.corrected}</span>
        </div>
      </div>

      <p className="text-xs text-[#5C5C5C] font-body mt-2 pt-2 border-t border-[#F2EFE9]">
        {correction.explanation}
      </p>
    </div>
  )
}
