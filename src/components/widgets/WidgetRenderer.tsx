import { useMemo } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { calculateDashboardStats, calculateDividendPayments, groupPaymentsByMonth, calculatePortfolioPerformance } from '../../lib/calculations'
import { startOfYear, endOfYear, format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'
import { WidgetType } from './WidgetTypes'
import { KPIWidget } from './KPIWidget'
import { GoalTracker } from '../GoalTracker'
import { GlassCard } from '../ui/GlassCard'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, Wallet, PiggyBank, Calendar as CalendarIcon, Award, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Activity, Percent, Info } from 'lucide-react'
import { SECTOR_LABELS } from '../../lib/types'
import { cn } from '../../lib/cn'

interface WidgetRendererProps {
  type: WidgetType
  rowHeight?: number
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
]

export function WidgetRenderer({ type, rowHeight = 65 }: WidgetRendererProps) {
  const { positions, taxConfig } = usePortfolio()

  const isCompact = rowHeight < 60
  const isMini = rowHeight < 50
  const p = isMini ? 'p-3' : isCompact ? 'p-4' : 'p-6'
  const titleClass = cn("font-bold tracking-tight text-white", isMini ? "text-[10px]" : "text-sm md:text-base")

  const stats = useMemo(() => {
    return calculateDashboardStats(positions, taxConfig.freeAllowance)
  }, [positions, taxConfig])

  const performance = useMemo(() => {
    return calculatePortfolioPerformance(positions)
  }, [positions])

  const chartData = useMemo(() => {
    const now = new Date()
    const yearStart = startOfYear(now)
    const yearEnd = endOfYear(now)

    const allPayments = positions.flatMap(position =>
      calculateDividendPayments(position, yearStart, yearEnd, taxConfig.freeAllowance)
    )

    const grouped = groupPaymentsByMonth(allPayments)

    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0')
      const monthKey = `${now.getFullYear()}-${monthNum}`
      const existing = grouped.find(g => g.month === monthKey)

      return {
        month: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][i],
        gross: existing?.gross || 0,
        net: existing?.net || 0,
        current: i === now.getMonth()
      }
    })
  }, [positions, taxConfig])

  const sectorData = useMemo(() => {
    const sectorValues: Record<string, number> = {}
    positions.forEach(position => {
      const price = position.currentPrice ?? position.purchasePrice
      const value = position.quantity * price
      sectorValues[position.sector] = (sectorValues[position.sector] || 0) + value
    })

    return Object.entries(sectorValues)
      .map(([sector, value]) => ({
        name: SECTOR_LABELS[sector as keyof typeof SECTOR_LABELS] || sector,
        value: Math.round(value),
      }))
      .sort((a, b) => b.value - a.value)
  }, [positions])

  const winnersLosers = useMemo(() => {
    const items = positions.map(p => {
      const current = p.currentPrice ?? p.purchasePrice
      const gain = current - p.purchasePrice
      const percent = (gain / p.purchasePrice) * 100
      return { ...p, gain, percent }
    }).sort((a, b) => b.percent - a.percent)

    return {
      winners: items.slice(0, 3),
      losers: [...items].reverse().slice(0, 3)
    }
  }, [positions])

  const nextPayment = useMemo(() => {
    const now = new Date()
    const allPayments = positions.flatMap(position =>
      calculateDividendPayments(position, now, endOfYear(now), taxConfig.freeAllowance)
    )
    return allPayments
      .filter(p => new Date(p.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  }, [positions, taxConfig])

  switch (type) {
    case 'gross-annual':
      return <KPIWidget title="Brutto / Jahr" value={stats.totalGrossAnnual} icon={TrendingUp} color="green" subtitle={`Ø ${(stats.totalGrossAnnual / 12).toFixed(0)} € / Monat`} rowHeight={rowHeight} />

    case 'net-annual':
      return <KPIWidget title="Netto / Jahr" value={stats.totalNetAnnual} icon={PiggyBank} color="blue" subtitle="Nach Steuern & Gebühren" rowHeight={rowHeight} />

    case 'monthly-average':
      return <KPIWidget title="Durchschnitt" value={stats.averageMonthlyNet} icon={CalendarIcon} color="purple" subtitle="Netto pro Monat" rowHeight={rowHeight} />

    case 'portfolio-value':
      return <KPIWidget title="Gesamtwert" value={performance.totalValue} icon={Wallet} color="orange" subtitle={`${positions.length} aktive Positionen`} rowHeight={rowHeight} />

    case 'performance-total':
      return <KPIWidget
        title="Performance"
        value={performance.totalGain}
        icon={Activity}
        color={performance.totalGain >= 0 ? "green" : "red"}
        trend={{ value: performance.performancePercent, isPositive: performance.totalGain >= 0 }}
        subtitle={performance.totalGain >= 0 ? "Gesamtgewinn" : "Gesamtverlust"}
        rowHeight={rowHeight}
      />

    case 'positions-count':
      return <KPIWidget title="Bestand" value={positions.length} icon={PieChartIcon} color="cyan" subtitle={`Ø ${(performance.totalValue / positions.length).toFixed(0)} € pro Aktie`} rowHeight={rowHeight} />

    case 'next-payment':
      return (
        <GlassCard variant="purple" className={cn("h-full flex flex-col justify-between group relative overflow-hidden", p)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={titleClass}>Nächste Zahlung</h3>
            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div>
            {nextPayment ? (
              <div className="space-y-1">
                <p className={cn("font-black text-white tracking-tight", isMini ? "text-xl" : "text-3xl")}>
                  {nextPayment.netAmount.toFixed(2)} €
                </p>
                {!isMini && (
                  <div className="mt-2 text-xs font-bold">
                    <p className="text-primary truncate uppercase tracking-widest">{nextPayment.positionName}</p>
                    <p className="text-muted-foreground mt-1">{format(new Date(nextPayment.date), 'dd. MMMM yyyy', { locale: de })}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-bold text-muted-foreground italic">Momentan keine ausstehend</p>
            )}
          </div>
          {/* Subtle Glow */}
          <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[50%] bg-primary/20 blur-[60px] rounded-full" />
        </GlassCard>
      )

    case 'monthly-chart':
      return (
        <GlassCard className={cn("h-full flex flex-col", p)}>
          <div className="flex items-end justify-between mb-6">
            <div className="flex flex-col">
              <h3 className={titleClass}>Dividenden-Historie</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Netto-Zufluss über das Jahr</p>
            </div>
            <div className="hidden lg:flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/50">
                <div className="w-2 h-2 rounded-full bg-primary" /> Netto
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'black', color: '#fff' }}
                  labelStyle={{ fontSize: '10px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
                />
                <Bar
                  dataKey="net"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={isMini ? 8 : 16}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.current ? 'url(#barGradientActive)' : 'url(#barGradient)'}
                      className={entry.current ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )

    case 'sector-pie':
      return (
        <GlassCard className={cn("h-full flex flex-col", p)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={titleClass}>Sektorverteilung</h3>
            <PieChartIcon className="h-5 w-5 text-muted-foreground/30" />
          </div>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%" cy="50%"
                  innerRadius={isMini ? 35 : 55} outerRadius={isMini ? 50 : 75}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {sectorData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(20,20,20,0.95)', border: 'none', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Sektoren</p>
                <p className={cn("font-black text-white", isMini ? "text-base" : "text-xl")}>{sectorData.length}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )

    case 'winners-losers':
      return (
        <GlassCard className={cn("h-full flex flex-col overflow-hidden", p)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={titleClass}>Markttrends</h3>
            <Activity className="h-5 w-5 text-muted-foreground/30" />
          </div>
          <div className="flex-1 space-y-4 overflow-auto pr-1 no-scrollbar">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-green-400 tracking-widest flex items-center gap-1.5 px-1">
                <ArrowUpRight className="h-3 w-3" /> Top Performer
              </p>
              {winnersLosers.winners.map(p => (
                <div key={p.id} className="flex justify-between items-center px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-green-500/10 hover:border-green-500/20 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{p.name}</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-medium">{p.ticker}</span>
                  </div>
                  <span className="text-xs font-black text-green-400 px-2 py-1 bg-green-400/10 rounded-lg group-hover:scale-110 transition-transform">+{p.percent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            {!isMini && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-red-500 tracking-widest flex items-center gap-1.5 px-1">
                  <ArrowDownRight className="h-3 w-3" /> Underperformer
                </p>
                {winnersLosers.losers.map(p => (
                  <div key={p.id} className="flex justify-between items-center px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-red-500/10 hover:border-red-500/20 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white truncate max-w-[120px]">{p.name}</span>
                      <span className="text-[9px] text-muted-foreground uppercase font-medium">{p.ticker}</span>
                    </div>
                    <span className="text-xs font-black text-red-500 px-2 py-1 bg-red-400/10 rounded-lg group-hover:scale-110 transition-transform">{p.percent.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      )

    case 'top-5-positions':
      const topPositions = [...positions]
        .map(p => ({ ...p, value: p.quantity * (p.currentPrice ?? p.purchasePrice) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, isMini ? 3 : 5)

      return (
        <GlassCard className={cn("h-full flex flex-col", p)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={titleClass}>Größte Positionen</h3>
            <Award className="h-5 w-5 text-yellow-500/50" />
          </div>
          <div className="flex-1 space-y-2 overflow-auto no-scrollbar">
            {topPositions.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all">
                <span className="w-6 text-xs font-black text-muted-foreground/30">0{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{p.name}</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{p.ticker}</p>
                </div>
                {!isMini && (
                  <div className="text-right">
                    <p className="text-xs font-black text-white">{p.value.toFixed(0)} €</p>
                    <p className="text-[9px] text-muted-foreground font-bold">{((p.value / performance.totalValue) * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )

    case 'goal-tracker':
      return (
        <GlassCard className={cn("h-full", p)}>
          <GoalTracker
            currentMonthlyDividend={stats.averageMonthlyNet}
            currentAnnualDividend={stats.totalNetAnnual}
            isCompact={isMini}
          />
        </GlassCard>
      )

    case 'tax-overview':
      return (
        <GlassCard variant="green" className={cn("h-full flex flex-col justify-between overflow-hidden relative", p)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={titleClass}>Steuer-Überblick</h3>
            <Info className="h-5 w-5 text-green-400/50" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/5 text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
              <span>Geschätzte Steuer</span>
              <span className="text-white">{(stats.totalWithholdingTax + stats.totalCapitalGainsTax).toFixed(0)} €</span>
            </div>
            <div className="p-4 rounded-2xl bg-green-400/10 border border-green-400/10 group hover:border-green-400/30 transition-all">
              <p className="text-[10px] font-black uppercase text-green-400 mb-1 tracking-widest">Verfügbarer FSA</p>
              <p className={cn("font-black text-white flex items-end gap-1", isMini ? "text-xl" : "text-3xl")}>
                {stats.freeAllowanceRemaining.toFixed(0)}
                <span className="text-sm font-medium opacity-50 mb-1.5">€</span>
              </p>
            </div>
          </div>
          {/* Subtle Glow */}
          <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] bg-green-400/10 blur-[60px] rounded-full" />
        </GlassCard>
      )

    case 'yield-overview':
      const avgYield = performance.totalValue > 0 ? (stats.totalGrossAnnual / performance.totalValue) * 100 : 0
      const yoc = performance.totalCost > 0 ? (stats.totalGrossAnnual / performance.totalCost) * 100 : 0
      return (
        <GlassCard className={cn("h-full flex flex-col justify-between", p)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={titleClass}>Renditekennzahlen</h3>
            <Percent className="h-5 w-5 text-muted-foreground/30" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Ø Brutto-Dividende</p>
              <p className={cn("font-black text-primary", isMini ? "text-xl" : "text-3xl")}>{avgYield.toFixed(1)}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Yield on Cost (YoC)</p>
              <p className={cn("font-black text-blue-400", isMini ? "text-xl" : "text-3xl")}>{yoc.toFixed(1)}%</p>
            </div>
          </div>
        </GlassCard>
      )

    default:
      return (
        <GlassCard className={cn("h-full flex items-center justify-center p-6 bg-white/5", p)}>
          <div className="text-center">
            <Activity className="h-8 w-8 text-primary/30 mx-auto mb-3" />
            <p className="text-sm font-black text-muted-foreground italic uppercase tracking-widest">In Entwicklung...</p>
          </div>
        </GlassCard>
      )
  }
}
