import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { calculateDRIP, compareDRIPScenarios, type DRIPScenario } from '../lib/dripCalculations'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react'

type ScenarioType = 'konservativ' | 'realistisch' | 'optimistisch' | 'custom'

export function DRIPSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('realistisch')
  const [customScenario, setCustomScenario] = useState<DRIPScenario>({
    name: 'Eigenes Szenario',
    initialInvestment: 10000,
    monthlyContribution: 500,
    years: 20,
    averageYield: 4.0,
    dividendGrowthRate: 5.0,
    sharePrice: 100,
    dividendPerShare: 1.0,
  })

  const predefinedScenarios: Record<Exclude<ScenarioType, 'custom'>, DRIPScenario> = {
    konservativ: {
      name: 'Konservativ',
      initialInvestment: 10000,
      monthlyContribution: 500,
      years: 20,
      averageYield: 3.0,
      dividendGrowthRate: 3.0,
      sharePrice: 100,
      dividendPerShare: 0.75,
    },
    realistisch: {
      name: 'Realistisch',
      initialInvestment: 10000,
      monthlyContribution: 500,
      years: 20,
      averageYield: 4.5,
      dividendGrowthRate: 5.0,
      sharePrice: 100,
      dividendPerShare: 1.125,
    },
    optimistisch: {
      name: 'Optimistisch',
      initialInvestment: 10000,
      monthlyContribution: 500,
      years: 20,
      averageYield: 6.0,
      dividendGrowthRate: 7.0,
      sharePrice: 100,
      dividendPerShare: 1.5,
    },
  }

  const activeScenario = selectedScenario === 'custom' ? customScenario : predefinedScenarios[selectedScenario]

  const results = useMemo(() => calculateDRIP(activeScenario), [activeScenario])

  const comparisonData = useMemo(() => {
    const scenarios = compareDRIPScenarios([
      predefinedScenarios.konservativ,
      predefinedScenarios.realistisch,
      predefinedScenarios.optimistisch,
    ])

    return scenarios
  }, [])

  const chartData = useMemo(() => {
    return results.map(r => ({
      year: r.year,
      portfolioValue: Math.round(r.portfolioValue),
      totalInvested: Math.round(r.totalInvested),
      annualDividend: Math.round(r.annualDividend),
      totalShares: Math.round(r.totalShares * 100) / 100,
    }))
  }, [results])

  const comparisonChartData = useMemo(() => {
    const maxYears = Math.max(...comparisonData.map(s => s.results.length))
    const data = []

    for (let i = 0; i < maxYears; i++) {
      const yearData: any = { year: i }
      comparisonData.forEach(scenario => {
        if (scenario.results[i]) {
          yearData[`${scenario.scenarioName}_portfolio`] = Math.round(scenario.results[i].portfolioValue)
          yearData[`${scenario.scenarioName}_dividend`] = Math.round(scenario.results[i].annualDividend)
        }
      })
      data.push(yearData)
    }

    return data
  }, [comparisonData])

  const finalResult = results[results.length - 1]
  const totalReturn = finalResult.portfolioValue - finalResult.totalInvested
  const returnPercentage = (totalReturn / finalResult.totalInvested) * 100

  const formatEuro = (value: number) => `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`

  const updateCustomScenario = (field: keyof DRIPScenario, value: number) => {
    setCustomScenario(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">DRIP-Simulator</h2>
        <p className="text-sm text-muted-foreground">
          Simuliere die automatische Wiederanlage deiner Dividenden
        </p>
      </div>

      {/* Szenario-Auswahl */}
      <Card>
        <CardHeader>
          <CardTitle>Szenario wählen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedScenario === 'konservativ' ? 'default' : 'outline'}
              onClick={() => setSelectedScenario('konservativ')}
            >
              Konservativ (3% Rendite)
            </Button>
            <Button
              variant={selectedScenario === 'realistisch' ? 'default' : 'outline'}
              onClick={() => setSelectedScenario('realistisch')}
            >
              Realistisch (4,5% Rendite)
            </Button>
            <Button
              variant={selectedScenario === 'optimistisch' ? 'default' : 'outline'}
              onClick={() => setSelectedScenario('optimistisch')}
            >
              Optimistisch (6% Rendite)
            </Button>
            <Button
              variant={selectedScenario === 'custom' ? 'default' : 'outline'}
              onClick={() => setSelectedScenario('custom')}
            >
              Eigenes Szenario
            </Button>
          </div>

          {selectedScenario === 'custom' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="initialInvestment">Startkapital (€)</Label>
                <Input
                  id="initialInvestment"
                  type="number"
                  value={customScenario.initialInvestment}
                  onChange={(e) => updateCustomScenario('initialInvestment', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="monthlyContribution">Monatlich (€)</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  value={customScenario.monthlyContribution}
                  onChange={(e) => updateCustomScenario('monthlyContribution', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="years">Jahre</Label>
                <Input
                  id="years"
                  type="number"
                  value={customScenario.years}
                  onChange={(e) => updateCustomScenario('years', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="averageYield">Dividendenrendite (%)</Label>
                <Input
                  id="averageYield"
                  type="number"
                  step="0.1"
                  value={customScenario.averageYield}
                  onChange={(e) => updateCustomScenario('averageYield', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="dividendGrowthRate">Dividendenwachstum (%)</Label>
                <Input
                  id="dividendGrowthRate"
                  type="number"
                  step="0.1"
                  value={customScenario.dividendGrowthRate}
                  onChange={(e) => updateCustomScenario('dividendGrowthRate', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="sharePrice">Aktienkurs (€)</Label>
                <Input
                  id="sharePrice"
                  type="number"
                  value={customScenario.sharePrice}
                  onChange={(e) => updateCustomScenario('sharePrice', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="dividendPerShare">Dividende/Aktie (€)</Label>
                <Input
                  id="dividendPerShare"
                  type="number"
                  step="0.01"
                  value={customScenario.dividendPerShare}
                  onChange={(e) => updateCustomScenario('dividendPerShare', Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ergebnis-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Portfolio-Wert</p>
                <p className="text-xl font-bold">{formatEuro(finalResult.portfolioValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamtgewinn</p>
                <p className="text-xl font-bold text-green-500">{formatEuro(totalReturn)}</p>
                <p className="text-xs text-muted-foreground">+{returnPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jährliche Dividende</p>
                <p className="text-xl font-bold text-blue-500">{formatEuro(finalResult.annualDividend)}</p>
                <p className="text-xs text-muted-foreground">{(finalResult.annualDividend / 12).toFixed(2)} €/Monat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Percent className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamt-Aktien</p>
                <p className="text-xl font-bold text-purple-500">{finalResult.totalShares.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">von {formatEuro(finalResult.totalInvested)} investiert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio-Wachstum Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio-Entwicklung über {activeScenario.years} Jahre</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
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
              <Line
                type="monotone"
                dataKey="portfolioValue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Portfolio-Wert"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="totalInvested"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Eingezahlt"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dividenden-Wachstum Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Dividenden-Wachstum</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                formatter={(value: number) => formatEuro(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Bar dataKey="annualDividend" fill="hsl(var(--primary))" name="Jährliche Dividende" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Szenarien-Vergleich */}
      <Card>
        <CardHeader>
          <CardTitle>Szenarien-Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" label={{ value: 'Jahre', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Portfolio-Wert (€)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value: number) => formatEuro(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Konservativ_portfolio"
                stroke="#ef4444"
                strokeWidth={2}
                name="Konservativ"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Realistisch_portfolio"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Realistisch"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Optimistisch_portfolio"
                stroke="#10b981"
                strokeWidth={2}
                name="Optimistisch"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Vergleichstabelle */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-medium">Szenario</th>
                  <th className="pb-2 font-medium text-right">End-Portfolio</th>
                  <th className="pb-2 font-medium text-right">Jährliche Dividende</th>
                  <th className="pb-2 font-medium text-right">Monatl. Dividende</th>
                  <th className="pb-2 font-medium text-right">Rendite</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(scenario => {
                  const final = scenario.results[scenario.results.length - 1]
                  const invested = final.totalInvested
                  const returns = final.portfolioValue - invested
                  const returnPct = (returns / invested) * 100

                  return (
                    <tr key={scenario.scenarioName} className="border-b">
                      <td className="py-3 font-medium">{scenario.scenarioName}</td>
                      <td className="py-3 text-right">{formatEuro(final.portfolioValue)}</td>
                      <td className="py-3 text-right text-green-600">{formatEuro(final.annualDividend)}</td>
                      <td className="py-3 text-right text-green-600">{formatEuro(final.annualDividend / 12)}</td>
                      <td className="py-3 text-right text-primary font-medium">+{returnPct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Erklärung */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Was ist DRIP?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            DRIP (Dividend Reinvestment Plan) bedeutet, dass alle erhaltenen Dividenden automatisch wieder in neue Aktien
            investiert werden. Dies führt zu einem Zinseszins-Effekt, der das Portfolio-Wachstum beschleunigt.
          </p>
          <h3 className="font-semibold mb-2">Berechnung</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Dividenden werden quartalsweise ausgeschüttet und sofort reinvestiert</li>
            <li>Monatliche Beiträge werden kontinuierlich investiert</li>
            <li>Dividendenwachstum wird jährlich angepasst</li>
            <li>Aktienkurs wächst moderat entsprechend der Rendite</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
