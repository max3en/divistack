import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Info, Calculator, AlertCircle } from 'lucide-react'

interface VorabpauschaleResult {
  portfolioValue: number
  basiszins: number
  vorabpauschale: number
  kest: number
  solidaritaet: number
  totalTax: number
  effectiveRate: number
}

export function VorabpauschaleCalculator() {
  const [portfolioValueStart, setPortfolioValueStart] = useState(50000)
  const [portfolioValueEnd, setPortfolioValueEnd] = useState(55000)
  const [actualDistributions, setActualDistributions] = useState(500)
  const [basiszins, setBasiszins] = useState(2.29) // 2024: 2,29%
  const [year, setYear] = useState(2024)

  const calculateVorabpauschale = (): VorabpauschaleResult => {
    // 1. Basisertrag = Anfangswert × Basiszins × 0,7
    const basisertrag = portfolioValueStart * (basiszins / 100) * 0.7

    // 2. Wertzuwachs = Endwert - Anfangswert
    const wertzuwachs = portfolioValueEnd - portfolioValueStart

    // 3. Vorabpauschale = min(Basisertrag, Wertzuwachs) - tatsächliche Ausschüttungen
    let vorabpauschale = Math.min(basisertrag, wertzuwachs) - actualDistributions

    // Vorabpauschale kann nicht negativ sein
    vorabpauschale = Math.max(0, vorabpauschale)

    // 4. Kapitalertragsteuer (25%)
    const kest = vorabpauschale * 0.25

    // 5. Solidaritätszuschlag (5,5% auf KESt)
    const solidaritaet = kest * 0.055

    // 6. Gesamte Steuerlast
    const totalTax = kest + solidaritaet

    // 7. Effektive Rate auf Wertzuwachs
    const effectiveRate = wertzuwachs > 0 ? (totalTax / wertzuwachs) * 100 : 0

    return {
      portfolioValue: portfolioValueStart,
      basiszins,
      vorabpauschale,
      kest,
      solidaritaet,
      totalTax,
      effectiveRate,
    }
  }

  const result = calculateVorabpauschale()

  const formatEuro = (value: number) => `${value.toFixed(2)} €`
  const formatPercent = (value: number) => `${value.toFixed(2)}%`

  const basisertrag = portfolioValueStart * (basiszins / 100) * 0.7
  const wertzuwachs = portfolioValueEnd - portfolioValueStart
  const minValue = Math.min(basisertrag, wertzuwachs)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vorabpauschale-Rechner</h2>
        <p className="text-sm text-muted-foreground">
          Berechne die Vorabpauschale für thesaurierende ETFs
        </p>
      </div>

      {/* Info-Box */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-2">Was ist die Vorabpauschale?</p>
              <p className="text-muted-foreground">
                Bei thesaurierenden (nicht ausschüttenden) ETFs wird eine Vorabpauschale besteuert.
                Sie sorgt dafür, dass auch ohne Ausschüttungen jährlich Steuern anfallen.
                Die tatsächliche Steuer wird beim Verkauf verrechnet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eingabe */}
      <Card>
        <CardHeader>
          <CardTitle>Eingabeparameter für {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Steuerjahr</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="basiszins">
                Basiszins (%)
                <span className="text-xs text-muted-foreground ml-2">
                  2024: 2,29% | 2025: ~2,5%
                </span>
              </Label>
              <Input
                id="basiszins"
                type="number"
                step="0.01"
                value={basiszins}
                onChange={(e) => setBasiszins(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="portfolioValueStart">
                Portfolio-Wert am 01.01.{year} (€)
              </Label>
              <Input
                id="portfolioValueStart"
                type="number"
                value={portfolioValueStart}
                onChange={(e) => setPortfolioValueStart(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="portfolioValueEnd">
                Portfolio-Wert am 31.12.{year} (€)
              </Label>
              <Input
                id="portfolioValueEnd"
                type="number"
                value={portfolioValueEnd}
                onChange={(e) => setPortfolioValueEnd(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="actualDistributions">
                Tatsächliche Ausschüttungen (€)
              </Label>
              <Input
                id="actualDistributions"
                type="number"
                value={actualDistributions}
                onChange={(e) => setActualDistributions(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Bei reinen thesaurierenden ETFs: 0€
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Berechnung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Berechnungsschritte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm">1. Basisertrag (Anfangswert × {basiszins}% × 0,7)</span>
              <span className="font-medium">{formatEuro(basisertrag)}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm">2. Wertzuwachs (Endwert - Anfangswert)</span>
              <span className={`font-medium ${wertzuwachs >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatEuro(wertzuwachs)}
              </span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm">3. Minimum von Basisertrag und Wertzuwachs</span>
              <span className="font-medium">{formatEuro(minValue)}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm">4. Abzüglich tatsächliche Ausschüttungen</span>
              <span className="font-medium text-red-500">- {formatEuro(actualDistributions)}</span>
            </div>

            <div className="h-px bg-border" />

            <div className="flex justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
              <span className="font-semibold">Vorabpauschale {year}</span>
              <span className="font-bold text-primary text-lg">{formatEuro(result.vorabpauschale)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steuerlast */}
      <Card className={result.vorabpauschale > 0 ? 'border-yellow-500/50' : 'border-green-500/50'}>
        <CardHeader>
          <CardTitle>Steuerlast {year}</CardTitle>
        </CardHeader>
        <CardContent>
          {result.vorabpauschale > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <span>Kapitalertragsteuer (25%)</span>
                <span className="font-medium">{formatEuro(result.kest)}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <span>Solidaritätszuschlag (5,5% auf KESt)</span>
                <span className="font-medium">{formatEuro(result.solidaritaet)}</span>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div>
                  <p className="font-semibold">Gesamte Steuerlast {year}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    = {formatPercent(result.effectiveRate)} effektiv auf Wertzuwachs
                  </p>
                </div>
                <span className="font-bold text-yellow-600 text-xl">{formatEuro(result.totalTax)}</span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/30">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Wichtig zu wissen:</p>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Die Vorabpauschale wird im Januar des Folgejahres fällig</li>
                    <li>Sie wird automatisch von deinem Verrechnungskonto eingezogen</li>
                    <li>Beim späteren Verkauf wird diese Steuer verrechnet (keine Doppelbesteuerung)</li>
                    <li>Freistellungsauftrag kann genutzt werden</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/30">
              <Info className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-600">Keine Vorabpauschale fällig</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {wertzuwachs < 0
                    ? `Bei negativem Wertzuwachs (${formatEuro(wertzuwachs)}) fällt keine Vorabpauschale an.`
                    : `Die Ausschüttungen (${formatEuro(actualDistributions)}) decken die Steuerlast bereits ab.`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schnellszenarien */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellszenarien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setPortfolioValueStart(10000)
                setPortfolioValueEnd(11000)
                setActualDistributions(0)
              }}
            >
              <span className="font-semibold mb-1">10k → 11k</span>
              <span className="text-xs text-muted-foreground">10% Wertzuwachs, keine Ausschüttung</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setPortfolioValueStart(50000)
                setPortfolioValueEnd(52500)
                setActualDistributions(0)
              }}
            >
              <span className="font-semibold mb-1">50k → 52,5k</span>
              <span className="text-xs text-muted-foreground">5% Wertzuwachs, keine Ausschüttung</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                setPortfolioValueStart(100000)
                setPortfolioValueEnd(107000)
                setActualDistributions(0)
              }}
            >
              <span className="font-semibold mb-1">100k → 107k</span>
              <span className="text-xs text-muted-foreground">7% Wertzuwachs, keine Ausschüttung</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Erklärung Formel */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Berechnungsformel</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="p-3 bg-background rounded font-mono text-xs">
              Vorabpauschale = min(Basisertrag, Wertzuwachs) - Ausschüttungen
            </div>

            <div>
              <p className="font-semibold text-foreground mb-1">Basisertrag:</p>
              <p>Anfangswert am 01.01. × Basiszins × 0,7 (Teilfreistellung)</p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-1">Wertzuwachs:</p>
              <p>Endwert am 31.12. - Anfangswert am 01.01.</p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-1">Basiszins {year}:</p>
              <p>
                Wird jährlich vom Bundesfinanzministerium festgelegt.
                {year === 2024 && ' Für 2024: 2,29%'}
                {year === 2025 && ' Für 2025: voraussichtlich ~2,5%'}
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground mb-1">Teilfreistellung (0,7):</p>
              <p>
                Bei Aktien-ETFs 30% Teilfreistellung = Faktor 0,7.
                Bei Misch-ETFs kann der Faktor abweichen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
