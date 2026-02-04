import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { usePortfolio } from '../context/PortfolioContext'
import { Shield, AlertTriangle, CheckCircle2, TrendingDown, Info } from 'lucide-react'

interface OptimizationResult {
  positionId: string
  positionName: string
  country: string
  grossAnnualDividend: number
  withholdingTaxRate: number
  withholdingTax: number
  suggestedFSA: number
  taxSavings: number
  priority: number
}

export function TaxOptimizer() {
  const { positions, taxConfig } = usePortfolio()

  const optimizationResults = useMemo(() => {
    const results: OptimizationResult[] = []

    // Berechne für jede Position
    positions.forEach(position => {
      // Berechne jährliche Brutto-Dividende
      const dividendInEUR = position.currency === 'EUR'
        ? position.dividendPerShare
        : position.dividendPerShare / position.exchangeRate

      const grossAnnual = dividendInEUR * position.quantity * position.paymentDates.length

      // Quellensteuer-Satz nach Land
      const withholdingRates: Record<string, number> = {
        'DE': 0,
        'US': 0.15,
        'CH': 0.35,
        'GB': 0,
        'FR': 0.12,
        'NL': 0.15,
        'IE': 0,
        'AT': 0,
        'IT': 0.26,
        'ES': 0.19,
      }

      const withholdingRate = withholdingRates[position.country] || 0
      const withholdingTax = grossAnnual * withholdingRate

      // Nach Quellensteuer
      const afterWithholding = grossAnnual - withholdingTax

      // KESt: 26,375% auf Betrag nach Quellensteuer
      const kest = afterWithholding * 0.26375

      // Quellensteuer kann auf KESt angerechnet werden
      const creditableTax = Math.min(withholdingTax, kest)
      const actualKest = kest - creditableTax

      // Priorität: Je höher die Steuerlast, desto wichtiger der FSA
      // Positionen mit hoher Quellensteuer sollten priorisiert werden
      const effectiveTaxRate = (withholdingTax + actualKest) / grossAnnual
      const priority = effectiveTaxRate * grossAnnual // Absolute Steuerlast

      results.push({
        positionId: position.id,
        positionName: position.name,
        country: position.country,
        grossAnnualDividend: grossAnnual,
        withholdingTaxRate: withholdingRate,
        withholdingTax: withholdingTax,
        suggestedFSA: 0, // Wird später berechnet
        taxSavings: 0, // Wird später berechnet
        priority,
      })
    })

    // Sortiere nach Priorität (höchste zuerst)
    results.sort((a, b) => b.priority - a.priority)

    // Verteile FSA
    let remainingFSA = taxConfig.freeAllowance
    results.forEach(result => {
      if (remainingFSA <= 0) {
        result.suggestedFSA = 0
        result.taxSavings = 0
        return
      }

      // Nutze so viel FSA wie möglich (aber nicht mehr als die Dividende)
      const allocatedFSA = Math.min(remainingFSA, result.grossAnnualDividend)
      result.suggestedFSA = allocatedFSA

      // Steuerersparnis: 26,375% auf den FSA-Betrag
      result.taxSavings = allocatedFSA * 0.26375

      remainingFSA -= allocatedFSA
    })

    return results
  }, [positions, taxConfig])

  const totalTaxSavings = optimizationResults.reduce((sum, r) => sum + r.taxSavings, 0)
  const totalWithholdingTax = optimizationResults.reduce((sum, r) => sum + r.withholdingTax, 0)
  const usedFSA = optimizationResults.reduce((sum, r) => sum + r.suggestedFSA, 0)
  const remainingFSA = taxConfig.freeAllowance - usedFSA

  const formatEuro = (value: number) => `${value.toFixed(2)} €`
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Steuer-Optimierung</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-12">
          Keine Positionen vorhanden. Füge Positionen hinzu, um Steueroptimierungen zu sehen.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Steuer-Optimierung</h2>
        <p className="text-sm text-muted-foreground">
          Optimiere deinen Freistellungsauftrag für maximale Steuerersparnis
        </p>
      </div>

      {/* Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">FSA verfügbar</p>
                <p className="text-xl font-bold">{formatEuro(taxConfig.freeAllowance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Steuerersparnis</p>
                <p className="text-xl font-bold text-green-500">{formatEuro(totalTaxSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">FSA genutzt</p>
                <p className="text-xl font-bold text-blue-500">{formatEuro(usedFSA)}</p>
                <p className="text-xs text-muted-foreground">
                  {((usedFSA / taxConfig.freeAllowance) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                remainingFSA > 0 ? 'bg-yellow-500/20' : 'bg-green-500/20'
              }`}>
                {remainingFSA > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">FSA übrig</p>
                <p className={`text-xl font-bold ${remainingFSA > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {formatEuro(remainingFSA)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnung wenn FSA nicht voll genutzt */}
      {remainingFSA > 100 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-600 dark:text-yellow-500">
                  Freistellungsauftrag nicht vollständig genutzt
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Du hast noch {formatEuro(remainingFSA)} FSA übrig. Erwäge, weitere Dividenden-Aktien hinzuzufügen
                  oder deine Positionen zu erhöhen, um die volle Steuerersparnis zu nutzen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimale FSA-Verteilung */}
      <Card>
        <CardHeader>
          <CardTitle>Optimale FSA-Verteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizationResults.map((result, index) => {
              const fsaPercentage = (result.suggestedFSA / taxConfig.freeAllowance) * 100
              const isFullyCovered = result.suggestedFSA >= result.grossAnnualDividend

              return (
                <div
                  key={result.positionId}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        <h3 className="font-semibold">{result.positionName}</h3>
                        <span className="text-xs text-muted-foreground">({result.country})</span>
                        {isFullyCovered && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Dividende: {formatEuro(result.grossAnnualDividend)}</span>
                        {result.withholdingTaxRate > 0 && (
                          <span>Quellensteuer: {formatPercent(result.withholdingTaxRate)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatEuro(result.suggestedFSA)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        FSA ({fsaPercentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-primary transition-all"
                      style={{ width: `${Math.min(fsaPercentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-muted-foreground">
                      {result.withholdingTax > 0 && (
                        <>Quellensteuer: {formatEuro(result.withholdingTax)} • </>
                      )}
                      Ersparnis: <span className="text-green-600 font-medium">{formatEuro(result.taxSavings)}</span>
                    </span>
                    {isFullyCovered && (
                      <span className="text-green-600 font-medium">Vollständig abgedeckt</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quellensteuer-Übersicht */}
      {totalWithholdingTax > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quellensteuer-Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Was ist Quellensteuer?</p>
                  <p className="text-muted-foreground">
                    Quellensteuer wird vom Ausland auf Dividenden erhoben, bevor sie ausgezahlt werden.
                    Diese kann teilweise auf die deutsche Kapitalertragsteuer angerechnet werden.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Quellensteuer nach Land:</p>
                {Array.from(new Set(optimizationResults.map(r => r.country)))
                  .filter(country => {
                    const countryResults = optimizationResults.filter(r => r.country === country)
                    return countryResults.some(r => r.withholdingTaxRate > 0)
                  })
                  .map(country => {
                    const countryResults = optimizationResults.filter(r => r.country === country)
                    const countryWithholding = countryResults.reduce((sum, r) => sum + r.withholdingTax, 0)
                    const countryRate = countryResults[0].withholdingTaxRate

                    return (
                      <div key={country} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{country}</p>
                          <p className="text-xs text-muted-foreground">
                            {countryResults.length} Position{countryResults.length !== 1 ? 'en' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatEuro(countryWithholding)}</p>
                          <p className="text-xs text-muted-foreground">{formatPercent(countryRate)}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg font-semibold">
                <span>Gesamt Quellensteuer:</span>
                <span className="text-red-500">{formatEuro(totalWithholdingTax)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erklärung */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">So funktioniert die Optimierung</h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>
              <strong>Priorität nach Steuerlast</strong>: Positionen mit höherer Steuerlast (v.a. Quellensteuer)
              erhalten zuerst FSA
            </li>
            <li>
              <strong>Maximale Ersparnis</strong>: Der FSA spart dir 26,375% KESt auf die freigestellten Dividenden
            </li>
            <li>
              <strong>Quellensteuer</strong>: Wird auf die KESt angerechnet, nicht auf den FSA
            </li>
            <li>
              <strong>Umsetzung</strong>: Nutze die vorgeschlagene Verteilung bei deiner Bank/deinem Broker
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
