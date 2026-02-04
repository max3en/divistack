import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { usePortfolio } from '../context/PortfolioContext'
import { calculateDashboardStats, calculateDividendPayments, groupPaymentsByMonth } from '../lib/calculations'
import { startOfYear, endOfYear, addDays, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Wallet, PiggyBank, Calendar as CalendarIcon, ArrowRight } from 'lucide-react'
import { SECTOR_LABELS } from '../lib/types'
import { GoalTracker } from './GoalTracker'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#fb923c', '#06b6d4', '#eab308', '#ef4444']

export function Dashboard() {
  const { positions, taxConfig } = usePortfolio()

  const stats = useMemo(() => {
    return calculateDashboardStats(positions, taxConfig.freeAllowance)
  }, [positions, taxConfig])

  const chartData = useMemo(() => {
    const now = new Date()
    const yearStart = startOfYear(now)
    const yearEnd = endOfYear(now)

    const allPayments = positions.flatMap(position =>
      calculateDividendPayments(position, yearStart, yearEnd, taxConfig.freeAllowance)
    )

    const grouped = groupPaymentsByMonth(allPayments)

    const months = Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0')
      const monthKey = `${now.getFullYear()}-${monthNum}`
      const existing = grouped.find(g => g.month === monthKey)

      return {
        month: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][i],
        gross: existing?.gross || 0,
        net: existing?.net || 0,
      }
    })

    return months
  }, [positions, taxConfig])

  const pieData = useMemo(() => {
    return positions.map(position => {
      const dividendInEUR = position.currency === 'EUR'
        ? position.dividendPerShare
        : position.dividendPerShare / position.exchangeRate

      const paymentsPerYear = {
        monthly: 12,
        quarterly: 4,
        'semi-annual': 2,
        annual: 1,
      }[position.paymentInterval]

      const annualDividend = dividendInEUR * position.quantity * paymentsPerYear

      return {
        name: position.name,
        value: annualDividend,
      }
    })
  }, [positions])

  const topPositions = useMemo(() => {
    return [...pieData]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [pieData])

  const sectorData = useMemo(() => {
    const sectorMap = new Map<string, number>()

    positions.forEach(position => {
      const dividendInEUR = position.currency === 'EUR'
        ? position.dividendPerShare
        : position.dividendPerShare / position.exchangeRate

      const paymentsPerYear = {
        monthly: 12,
        quarterly: 4,
        'semi-annual': 2,
        annual: 1,
      }[position.paymentInterval]

      const annualDividend = dividendInEUR * position.quantity * paymentsPerYear
      const currentValue = sectorMap.get(position.sector) || 0
      sectorMap.set(position.sector, currentValue + annualDividend)
    })

    return Array.from(sectorMap.entries()).map(([sector, value]) => ({
      name: SECTOR_LABELS[sector as keyof typeof SECTOR_LABELS] || sector,
      value,
    }))
  }, [positions])

  const upcomingPayments = useMemo(() => {
    const now = new Date()
    const next30Days = addDays(now, 30)

    const allPayments = positions.flatMap(position =>
      calculateDividendPayments(position, now, next30Days, taxConfig.freeAllowance)
    )

    return allPayments
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }, [positions, taxConfig])

  const nextPayment = upcomingPayments[0]

  const formatEuro = (value: number) => `${value.toFixed(2)} €`

  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Noch keine Positionen im Portfolio.
          </p>
          <p className="text-sm text-muted-foreground">
            Füge deine erste Aktie oder ETF hinzu, um das Dashboard zu sehen.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Brutto/Jahr</p>
                <p className="text-3xl font-bold text-green-600">{formatEuro(stats.totalGrossAnnual)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ø {formatEuro(stats.totalGrossAnnual / 12)}/Monat
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Netto/Jahr</p>
                <p className="text-3xl font-bold text-blue-600">{formatEuro(stats.totalNetAnnual)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ø {formatEuro(stats.averageMonthlyNet)}/Monat
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Steuerlast</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatEuro(stats.totalWithholdingTax + stats.totalCapitalGainsTax)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.totalWithholdingTax + stats.totalCapitalGainsTax) / stats.totalGrossAnnual * 100).toFixed(1)}% vom Brutto
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <PiggyBank className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nächste Zahlung</p>
                {nextPayment ? (
                  <>
                    <p className="text-3xl font-bold text-purple-600">{formatEuro(nextPayment.netAmount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(nextPayment.date), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-muted-foreground">Keine</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Tracker */}
      <GoalTracker
        currentMonthlyDividend={stats.averageMonthlyNet}
        currentAnnualDividend={stats.totalNetAnnual}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Dividenden pro Monat ({new Date().getFullYear()})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: number) => formatEuro(value)}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="gross" fill="#22c55e" name="Brutto" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" fill="#3b82f6" name="Netto" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatEuro(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sector Donut Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sektor-Diversifikation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatEuro(value)}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Row - Top 5 & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Positions */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Dividendenzahler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPositions.map((position, index) => {
              const maxValue = topPositions[0]?.value || 1
              const percentage = (position.value / maxValue) * 100

              return (
                <div key={position.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium">{position.name}</span>
                    </div>
                    <span className="font-bold text-green-600">{formatEuro(position.value)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Kommende Zahlungen (30 Tage)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment, index) => (
                <div key={`${payment.positionId}-${payment.date}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{payment.positionName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.date), 'dd. MMMM yyyy', { locale: de })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatEuro(payment.netAmount)}</p>
                    <p className="text-xs text-muted-foreground">Brutto: {formatEuro(payment.grossAmount)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Keine Zahlungen in den nächsten 30 Tagen
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
