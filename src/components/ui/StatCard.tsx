import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  accent?: boolean
}

export function StatCard({ label, value, sub, icon, trend, trendValue, className, accent }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'card relative overflow-hidden',
        accent && 'border-brand-500/30 bg-brand-500/5',
        className,
      )}
    >
      {accent && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>
          <p className={cn('text-2xl font-black mt-1', accent ? 'text-gradient' : 'text-white')}>{value}</p>
          {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
          {trendValue && (
            <p className={cn('text-xs font-medium mt-1', {
              'text-green-400': trend === 'up',
              'text-red-400': trend === 'down',
              'text-white/40': trend === 'neutral',
            })}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('p-2 rounded-lg', accent ? 'bg-brand-500/20 text-brand-400' : 'bg-white/5 text-white/40')}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
