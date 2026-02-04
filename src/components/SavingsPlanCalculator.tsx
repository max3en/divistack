import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { calculateSavingsPlan, type SavingsPlanGoal } from '../lib/dripCalculations'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Target, TrendingUp, Calendar, Wallet } from 'lucide-react'

export function SavingsPlanCalculator() {
  const [goal, setGoal] = useState<SavingsPlanGoal>({
    targetAnnualDividend: 12000, // 1.000€/Monat
    averageYield: 4.5,
    years: 20,
    dividendGrowthRate: 5.0,
    initialInvestment: 0,
  })

  const result = useMemo(() => calculateSavingsPlan(goal), [goal])

  const chartData = useMemo(() => {
    return result.yearlyBreakdown.map(year => ({
      year: year.year,
      portfolioValue: Math.round(year.portfolioValue),
      annualDividend: Math.round(year.annualDividend),
      monthlyDividend: Math.round(year.annualDividend / 12),
      contributions: Math.round(year.monthlyContribution * 12 * year.year),
    }))
  }, [result])

  const updateGoal = (field: keyof SavingsPlanGoal, value: number) => {
    setGoal(prev => ({ ...prev, [field]: value }))
  }

  const formatEuro = (value: number) => `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`

  const quickGoals = [
    { label: '500€/Monat', annual: 6000 },
    { label: '1.000€/Monat', annual: 12000 },
    { label: '2.000€/Monat', annual: 24000 },
    { label: '5.000€/Monat', annual: 60000 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sparplan-Kalkulator</h2>
        <p className="text-sm text-muted-foreground">
          Berechne, wie viel du monatlich investieren musst für dein Dividenden-Ziel
        </p>
      </div>

      {/* Schnellauswahl */}
      <Card>
        <CardHeader>
          <CardTitle>Dein Dividenden-Ziel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {quickGoals.map(quick => (
              <Button
                key={quick.annual}
                variant={goal.targetAnnualDividend === quick.annual ? 'default' : 'outline'}
                onClick={() => updateGoal('targetAnnualDividend', quick.annual)}
              >
                {quick.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="targetAnnualDividend">Ziel: Jährliche Dividende (€)</Label>
              <Input
                id="targetAnnualDividend"
                type="number"
                value={goal.targetAnnualDividend}
                onChange={(e) => updateGoal('targetAnnualDividend', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                = {(goal.targetAnnualDividend / 12).toFixed(2)} €/Monat
              </p>
            </div>

            <div>
              <Label htmlFor="years">Zeitraum (Jahre)</Label>
              <Input
                id="years"
                type="number"
                value={goal.years}
                onChange={(e) => updateGoal('years', Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="initialInvestment">Startkapital (€)</Label>
              <Input
                id="initialInvestment"
                type="number"
                value={goal.initialInvestment}
                onChange={(e) => updateGoal('initialInvestment', Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="averageYield">Dividendenrendite (%)</Label>
              <Input
                id="averageYield"
                type="number"
                step="0.1"
                value={goal.averageYield}
                onChange={(e) => updateGoal('averageYield', Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="dividendGrowthRate">Dividendenwachstum (%/Jahr)</Label>
              <Input
                id="dividendGrowthRate"
                type="number"
                step="0.1"
                value={goal.dividendGrowthRate}
                onChange={(e) => updateGoal('dividendGrowthRate', Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ergebnis */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Du musst monatlich investieren:</p>
              <p className="text-4xl font-bold text-primary">
                {formatEuro(result.requiredMonthlyContribution)}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Gesamt investiert</p>
              <p className="text-lg font-semibold">{formatEuro(result.totalInvested)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">End-Portfolio</p>
              <p className="text-lg font-semibold text-primary">{formatEuro(result.finalPortfolioValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Jährliche Dividende</p>
              <p className="text-lg font-semibold text-green-600">{formatEuro(result.finalAnnualDividend)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gewinn</p>
              <p className="text-lg font-semibold text-green-600">
                {formatEuro(result.finalPortfolioValue - result.totalInvested)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zeitstrahl-Visualisierung */}
      <Card>
        <CardHeader>
          <CardTitle>Entwicklung über {goal.years} Jahre</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="year"
                label={{ value: 'Jahre', position: 'insideBottom', offset: -5 }}
                className="text-xs"
              />
              <YAxis
                label={{ value: 'Euro (€)', angle: -90, position: 'insideLeft' }}
                className="text-xs"
              />
              <Tooltip
                formatter={(value: number) => formatEuro(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="contributions"
                stroke="hsl(var(--muted-foreground))"
                fill="url(#colorContributions)"
                name="Eingezahlt"
              />
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorPortfolio)"
                name="Portfolio-Wert"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dividenden-Wachstum */}
      <Card>
        <CardHeader>
          <CardTitle>Deine zukünftigen Dividenden</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                formatter={(value: number) => formatEuro(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="annualDividend"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Jährliche Dividende"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Jahres-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Jahres-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Meilensteine */}
            {result.yearlyBreakdown
              .filter((_, idx) => idx === 0 || idx === Math.floor(goal.years / 2) || idx === goal.years - 1)
              .map(year => (
                <div
                  key={year.year}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      Jahr {year.year}
                      {year.year === goal.years && ' - Ziel erreicht! 🎉'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Portfolio</p>
                        <p className="font-medium">{formatEuro(year.portfolioValue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Jährlich</p>
                        <p className="font-medium text-green-600">{formatEuro(year.annualDividend)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Monatlich</p>
                        <p className="font-medium text-green-600">{formatEuro(year.annualDividend / 12)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Beitrag/Monat</p>
                        <p className="font-medium">{formatEuro(year.monthlyContribution)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Detail-Tabelle */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-medium">Jahr</th>
                  <th className="pb-2 font-medium text-right">Portfolio-Wert</th>
                  <th className="pb-2 font-medium text-right">Jährliche Dividende</th>
                  <th className="pb-2 font-medium text-right">Monatliche Dividende</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyBreakdown
                  .filter(year => year.year % Math.max(1, Math.floor(goal.years / 10)) === 0 || year.year === goal.years)
                  .map(year => (
                    <tr key={year.year} className="border-b">
                      <td className="py-2">{year.year}</td>
                      <td className="py-2 text-right">{formatEuro(year.portfolioValue)}</td>
                      <td className="py-2 text-right text-green-600">{formatEuro(year.annualDividend)}</td>
                      <td className="py-2 text-right text-green-600 font-medium">
                        {formatEuro(year.annualDividend / 12)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Szenarien-Vergleich */}
      <Card>
        <CardHeader>
          <CardTitle>Was-wäre-wenn Szenarien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Konservativ (3% Rendite)', yield: 3.0, growth: 3.0 },
              { label: 'Realistisch (4,5% Rendite)', yield: 4.5, growth: 5.0 },
              { label: 'Optimistisch (6% Rendite)', yield: 6.0, growth: 7.0 },
            ].map(scenario => {
              const scenarioGoal = { ...goal, averageYield: scenario.yield, dividendGrowthRate: scenario.growth }
              const scenarioResult = calculateSavingsPlan(scenarioGoal)

              return (
                <div
                  key={scenario.label}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{scenario.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Dividendenwachstum: {scenario.growth}% pro Jahr
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatEuro(scenarioResult.requiredMonthlyContribution)}/Monat
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Portfolio: {formatEuro(scenarioResult.finalPortfolioValue)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Erklärung */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Wie funktioniert die Berechnung?</h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>
              <strong>Monatlicher Beitrag</strong>: Wird kontinuierlich investiert und erhöht dein Portfolio
            </li>
            <li>
              <strong>Dividenden-Reinvestition</strong>: Alle Dividenden werden automatisch wieder angelegt (DRIP)
            </li>
            <li>
              <strong>Dividendenwachstum</strong>: Unternehmen erhöhen oft ihre Dividenden jährlich
            </li>
            <li>
              <strong>Zinseszins-Effekt</strong>: Je länger der Zeitraum, desto stärker der Effekt
            </li>
            <li>
              <strong>Durchschnittliche Rendite</strong>: Historisch liegt die Dividendenrendite von Qualitätsaktien bei 3-5%
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Hinweis: Dies ist eine vereinfachte Berechnung. Reale Ergebnisse können durch Steuern, Inflation und
            Marktschwankungen abweichen.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
