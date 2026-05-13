import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-white/10 text-white/80',
  brand: 'bg-brand-500/20 text-brand-400 border border-brand-500/30',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  bronze: 'bg-[#cd7f32]/20 text-[#cd7f32] border border-[#cd7f32]/30',
  silver: 'bg-[#c0c0c0]/20 text-[#c0c0c0] border border-[#c0c0c0]/30',
  gold: 'bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/30',
  platinum: 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30',
  diamond: 'bg-[#b9f2ff]/20 text-[#b9f2ff] border border-[#b9f2ff]/30',
  master: 'bg-[#9b59b6]/20 text-[#9b59b6] border border-[#9b59b6]/30',
  grandmaster: 'bg-[#e74c3c]/20 text-[#e74c3c] border border-[#e74c3c]/30',
  challenger: 'bg-[#f39c12]/20 text-[#f39c12] border border-[#f39c12]/30',
}

type Variant = keyof typeof variants

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider', variants[variant], className)}>
      {children}
    </span>
  )
}
