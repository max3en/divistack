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
import { TrendingUp, Wallet, PiggyBank, Calendar as CalendarIcon, Award, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Activity, Percent } from 'lucide-react'
import { SECTOR_LABELS } from '../../lib/types'
import { cn } from '../../lib/cn'

interface WidgetRendererProps {
  type: WidgetType
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#84cc16', '#0ea5e9']

export function WidgetRenderer({ type }: WidgetRendererProps) {
  const { positions, taxConfig } = usePortfolio()

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

  const upcomingPayments = useMemo(() => {
    const now = new Date()
    const allPayments = positions.flatMap(position =>
      calculateDividendPayments(position, now, addDays(now, 90), taxConfig.freeAllowance)
    )
    return allPayments
      .filter(p => new Date(p.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10)
  }, [positions, taxConfig])

  // Widget Rendering Switch
  switch (type) {
    case 'gross-annual':
      return <KPIWidget title="Brutto/Jahr" value={stats.totalGrossAnnual} icon={TrendingUp} color="green" subtitle={`Ø ${(stats.totalGrossAnnual / 12).toFixed(0)} €/Monat`} />

    case 'net-annual':
      return <KPIWidget title="Netto/Jahr" value={stats.totalNetAnnual} icon={PiggyBank} color="blue" subtitle="Nach allen Steuern" />

    case 'monthly-average':
      return <KPIWidget title="Ø Monatlich" value={stats.averageMonthlyNet} icon={CalendarIcon} color="purple" subtitle="Netto/Monat" />

    case 'portfolio-value':
      return <KPIWidget title="Portfolio-Wert" value={performance.totalValue} icon={Wallet} color="orange" subtitle={`${positions.length} Positionen`} />

    case 'performance-total':
      return <KPIWidget
        title="Gesamt-Performance"
        value={performance.totalGain}
        icon={Activity}
        color={performance.totalGain >= 0 ? "green" : "red"}
        trend={{ value: performance.performancePercent, isPositive: performance.totalGain >= 0 }}
        subtitle={performance.totalGain >= 0 ? "Insgesamt Gewinn" : "Insgesamt Verlust"}
      />

    case 'positions-count':
      return <KPIWidget title="Positionen" value={positions.length} icon={PieChartIcon} color="cyan" subtitle={`Ø ${(performance.totalValue / positions.length).toFixed(0)} € pro Aktie`} />

    case 'next-payment':
      return (
        <GlassCard className="h-full p-6 flex flex-col justify-between overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-purple-500/10 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Nächste Zahlung</p>
            {nextPayment ? (
              <>
                <p className="text-2xl font-black text-purple-500">{nextPayment.netAmount.toFixed(2)} €</p>
                <div className="mt-2 text-sm font-medium">
                  <p className="truncate">{nextPayment.positionName}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(nextPayment.date), 'dd. MMMM yyyy', { locale: de })}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground italic">Keine anstehend</p>
            )}
          </div>
          <CalendarIcon className="h-6 w-6 text-purple-500/50 self-end" />
        </GlassCard>
      )

    case 'monthly-chart':
      return (
        <GlassCard className="h-full p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold tracking-tight text-lg">Dividenden-Fluss</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-green-500"><div className="w-2 h-2 rounded-full bg-green-500" /> Brutto</div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-blue-500"><div className="w-2 h-2 rounded-full bg-blue-500" /> Netto</div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} dy={10} />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="gross" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGross)" />
                <Area type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )

    case 'sector-pie':
      return (
        <GlassCard className="h-full p-6 flex flex-col">
          <h3 className="font-bold tracking-tight text-lg mb-6">Sektor-Verteilung</h3>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sectorData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Sektoren</p>
                <p className="text-xl font-black">{sectorData.length}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )

    case 'winners-losers':
      return (
        <GlassCard className="h-full p-6 flex flex-col overflow-hidden">
          <h3 className="font-bold tracking-tight text-lg mb-4">Top & Flop Performance</h3>
          <div className="flex-1 space-y-4 overflow-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-green-500 tracking-widest flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> Top Gewinner
              </p>
              {winnersLosers.winners.map(p => (
                <div key={p.id} className="flex justify-between items-center p-2 rounded-xl bg-green-500/5 border border-green-500/10">
                  <span className="text-sm font-bold truncate pr-2">{p.name}</span>
                  <span className="text-sm font-black text-green-500">+{p.percent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-red-500 tracking-widest flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" /> Top Verlierer
              </p>
              {winnersLosers.losers.map(p => (
                <div key={p.id} className="flex justify-between items-center p-2 rounded-xl bg-red-500/5 border border-red-500/10">
                  <span className="text-sm font-bold truncate pr-2">{p.name}</span>
                  <span className="text-sm font-black text-red-500">{p.percent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )

    case 'top-5-positions':
      const topPositions = [...positions]
        .map(p => ({ ...p, value: p.quantity * (p.currentPrice ?? p.purchasePrice) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      return (
        <GlassCard className="h-full p-6 flex flex-col">
          <h3 className="font-bold tracking-tight text-lg mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" /> Top 5 Holdings
          </h3>
          <div className="flex-1 space-y-3 overflow-auto">
            {topPositions.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                <span className="w-5 text-lg font-black text-muted-foreground/30 italic">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{p.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">{p.value.toFixed(0)} €</p>
                  <p className="text-[10px] text-primary font-bold">{((p.value / performance.totalValue) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )

    case 'goal-tracker':
      return (
        <GlassCard className="h-full p-6">
          <GoalTracker
            currentMonthlyDividend={stats.averageMonthlyNet}
            currentAnnualDividend={stats.totalNetAnnual}
          />
        </GlassCard>
      )

    case 'tax-overview':
      return (
        <GlassCard className="h-full p-6 flex flex-col justify-between">
          <h3 className="font-bold tracking-tight text-lg mb-4">Steuer & FSA</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <span className="text-xs font-bold uppercase text-muted-foreground">Quellensteuer</span>
              <span className="font-black">{stats.totalWithholdingTax.toFixed(0)} €</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <span className="text-xs font-bold uppercase text-muted-foreground">Kapitalertrag</span>
              <span className="font-black">{stats.totalCapitalGainsTax.toFixed(0)} €</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-[10px] font-black uppercase text-primary mb-1 tracking-widest">FSA Verbleibend</p>
              <p className="text-2xl font-black text-primary">{stats.freeAllowanceRemaining.toFixed(0)} €</p>
            </div>
          </div>
        </GlassCard>
      )

    case 'yield-overview':
      const avgYield = performance.totalValue > 0 ? (stats.totalGrossAnnual / performance.totalValue) * 100 : 0
      const yoc = performance.totalCost > 0 ? (stats.totalGrossAnnual / performance.totalCost) * 100 : 0
      return (
        <GlassCard className="h-full p-6 flex flex-col justify-between">
          <h3 className="font-bold tracking-tight text-lg mb-4">Rendite</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <p className="text-[10px] font-black uppercase text-green-500 mb-1">Ø Rendite</p>
              <p className="text-xl font-black text-green-500">{avgYield.toFixed(2)}%</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <p className="text-[10px] font-black uppercase text-blue-500 mb-1">Yield on Cost</p>
              <p className="text-xl font-black text-blue-500">{yoc.toFixed(2)}%</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Brutto/Jahr</span>
            <span className="font-black text-lg">{stats.totalGrossAnnual.toFixed(0)} €</span>
          </div>
        </GlassCard>
      )

    default:
      return (
        <GlassCard className="h-full p-6 flex items-center justify-center italic text-muted-foreground">
          Widget wird bald verfügbar sein...
        </GlassCard>
      )
  }
}
