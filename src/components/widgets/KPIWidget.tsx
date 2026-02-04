import { GlassCard } from '../ui/GlassCard'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

interface KPIWidgetProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'cyan' | 'red'
  trend?: { value: number; isPositive: boolean }
}

const colorConfigs = {
  green: {
    gradient: 'from-green-500/20 to-emerald-500/0',
    iconBg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    icon: 'text-green-500',
  },
  blue: {
    gradient: 'from-blue-500/20 to-indigo-500/0',
    iconBg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-500',
  },
  purple: {
    gradient: 'from-purple-500/20 to-violet-500/0',
    iconBg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    icon: 'text-purple-500',
  },
  orange: {
    gradient: 'from-orange-500/20 to-amber-500/0',
    iconBg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    icon: 'text-orange-500',
  },
  pink: {
    gradient: 'from-pink-500/20 to-rose-500/0',
    iconBg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    icon: 'text-pink-500',
  },
  cyan: {
    gradient: 'from-cyan-500/20 to-sky-500/0',
    iconBg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    icon: 'text-cyan-500',
  },
  red: {
    gradient: 'from-red-500/20 to-orange-500/0',
    iconBg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    icon: 'text-red-500',
  },
}

export function KPIWidget({ title, value, subtitle, icon: Icon, color, trend }: KPIWidgetProps) {
  const config = colorConfigs[color]

  return (
    <div className="group h-full transition-all hover:scale-[1.02] active:scale-[0.98]">
      <GlassCard className="h-full border-none shadow-lg overflow-hidden flex flex-col justify-between">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", config.gradient)} />

        <div className="relative p-6 flex flex-col h-full justify-between gap-2">
          <div className="flex items-start justify-between">
            <div className={cn("p-2.5 rounded-xl transition-colors", config.iconBg)}>
              <Icon className={cn("h-5 w-5", config.icon)} />
            </div>
            {trend && (
              <div className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1",
                trend.isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}>
                {trend.isPositive ? '+ ' : '- '}
                {Math.abs(trend.value).toFixed(1)}%
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-2xl font-black tracking-tight", config.text)}>
                {typeof value === 'number' ? value.toLocaleString('de-DE', { maximumFractionDigits: 0 }) : value}
              </span>
              {typeof value === 'number' && <span className="text-sm font-bold text-muted-foreground opacity-50">€</span>}
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground/80 font-medium truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
