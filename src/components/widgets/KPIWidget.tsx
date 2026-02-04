import { GlassCard } from '../ui/GlassCard'
import { LucideIcon, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/cn'

interface KPIWidgetProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'cyan' | 'red'
  trend?: { value: number; isPositive: boolean }
  rowHeight?: number
}

const colorConfigs: Record<string, any> = {
  green: {
    variant: 'green',
    iconBg: 'bg-green-500/10',
    text: 'text-white',
    icon: 'text-green-400',
    badge: 'bg-green-400/20 text-green-400',
  },
  blue: {
    variant: 'default',
    iconBg: 'bg-blue-500/10',
    text: 'text-white',
    icon: 'text-blue-400',
    badge: 'bg-blue-400/20 text-blue-400',
  },
  purple: {
    variant: 'purple',
    iconBg: 'bg-purple-500/20',
    text: 'text-white',
    icon: 'text-purple-400',
    badge: 'bg-purple-400/20 text-purple-400',
  },
  orange: {
    variant: 'yellow',
    iconBg: 'bg-orange-500/10',
    text: 'text-white',
    icon: 'text-orange-400',
    badge: 'bg-orange-400/20 text-orange-400',
  },
  pink: {
    variant: 'default',
    iconBg: 'bg-pink-500/10',
    text: 'text-white',
    icon: 'text-pink-400',
    badge: 'bg-pink-400/20 text-pink-400',
  },
  cyan: {
    variant: 'default',
    iconBg: 'bg-cyan-500/10',
    text: 'text-white',
    icon: 'text-cyan-400',
    badge: 'bg-cyan-400/20 text-cyan-400',
  },
  red: {
    variant: 'default',
    iconBg: 'bg-red-500/10',
    text: 'text-white',
    icon: 'text-red-400',
    badge: 'bg-red-400/20 text-red-400',
  },
}

export function KPIWidget({ title, value, subtitle, icon: Icon, color, trend, rowHeight = 65 }: KPIWidgetProps) {
  const config = colorConfigs[color] || colorConfigs.purple

  const isCompact = rowHeight < 60
  const isMini = rowHeight < 50

  return (
    <div className="group h-full transition-all duration-300">
      <GlassCard variant={config.variant} className="h-full border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
        <div className={cn(
          "relative flex flex-col h-full",
          isMini ? "p-3" : isCompact ? "p-4" : "p-5"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-auto">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-full flex items-center justify-center transition-all",
                config.iconBg,
                isMini ? "h-7 w-7" : "h-9 w-9"
              )}>
                <Icon className={cn(
                  config.icon,
                  isMini ? "h-3.5 w-3.5" : "h-4.5 w-4.5"
                )} />
              </div>
              <p className={cn(
                "font-bold text-muted-foreground tracking-tight whitespace-nowrap",
                isMini ? "text-[10px]" : "text-xs"
              )}>{title}</p>
            </div>
            {!isMini && <MoreHorizontal className="h-4 w-4 text-muted-foreground/30" />}
          </div>

          {/* Main Value Area */}
          <div className="mt-4 flex flex-col">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={cn(
                "font-bold tracking-tight text-white",
                isMini ? "text-xl" : isCompact ? "text-2xl" : "text-3xl"
              )}>
                {typeof value === 'number' ? value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : value}
                {typeof value === 'number' && <span className="ml-1 opacity-50 text-sm font-medium">,00</span>}
              </span>

              {trend && !isMini && (
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1",
                  trend.isPositive ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                )}>
                  {trend.isPositive ? '↑ ' : '↓ '}
                  {Math.abs(trend.value).toFixed(0)}%
                </div>
              )}
            </div>

            {(subtitle || (trend && isMini)) && (
              <p className="mt-1 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest flex items-center gap-2">
                {subtitle}
                {trend && isMini && (
                  <span className={trend.isPositive ? "text-green-400" : "text-red-400"}>
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(0)}%
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Purple Glow Effect for Purple Variant */}
          {config.variant === 'purple' && (
            <div className="absolute bottom-[-20%] left-[20%] right-[20%] h-[40%] bg-primary/20 blur-[40px] rounded-full pointer-events-none opacity-50" />
          )}
        </div>
      </GlassCard>
    </div>
  )
}
