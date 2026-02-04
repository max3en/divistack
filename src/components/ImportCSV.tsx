import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Upload, AlertCircle, CheckCircle2, FileText } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext'
import type { Position, Currency, Sector, PaymentInterval } from '../lib/types'

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

export function ImportCSV() {
  const { addPosition } = usePortfolio()
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim())
    return lines.map(line => {
      // Einfacher CSV-Parser (trennt bei Komma, respektiert Anführungszeichen)
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setResult(null)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length < 2) {
        setResult({ success: 0, failed: 0, errors: ['CSV-Datei ist leer oder ungültig'] })
        setIsProcessing(false)
        return
      }

      // Erste Zeile als Header
      const header = rows[0].map(h => h.toLowerCase().trim())
      const dataRows = rows.slice(1)

      let success = 0
      let failed = 0
      const errors: string[] = []

      // Erwartete Spalten (flexible Zuordnung)
      const getColumnIndex = (aliases: string[]) => {
        for (const alias of aliases) {
          const index = header.findIndex(h => h.includes(alias))
          if (index !== -1) return index
        }
        return -1
      }

      const indices = {
        name: getColumnIndex(['name', 'aktie', 'stock', 'wertpapier']),
        isin: getColumnIndex(['isin']),
        ticker: getColumnIndex(['ticker', 'symbol', 'kürzel']),
        quantity: getColumnIndex(['quantity', 'anzahl', 'stück', 'shares']),
        purchasePrice: getColumnIndex(['purchase', 'kaufpreis', 'preis', 'price']),
        currentPrice: getColumnIndex(['current', 'aktuell', 'kurs']),
        dividendPerShare: getColumnIndex(['dividend', 'dividende', 'div']),
        country: getColumnIndex(['country', 'land']),
        currency: getColumnIndex(['currency', 'währung']),
        sector: getColumnIndex(['sector', 'sektor', 'branche']),
        paymentInterval: getColumnIndex(['interval', 'intervall', 'payment']),
      }

      // Validiere Pflichtfelder
      if (indices.name === -1 || indices.isin === -1 || indices.quantity === -1) {
        setResult({
          success: 0,
          failed: 0,
          errors: ['CSV muss mindestens Spalten für Name, ISIN und Anzahl enthalten'],
        })
        setIsProcessing(false)
        return
      }

      // Importiere jede Zeile
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
        const rowNum = i + 2 // +2 weil Header = Zeile 1, und wir bei 0 starten

        try {
          // Pflichtfelder
          const name = row[indices.name]?.trim()
          const isin = row[indices.isin]?.trim()
          const quantity = Number(row[indices.quantity]?.replace(',', '.'))

          if (!name || !isin || isNaN(quantity) || quantity <= 0) {
            errors.push(`Zeile ${rowNum}: Ungültige Pflichtfelder`)
            failed++
            continue
          }

          // Optionale Felder mit Defaults
          const ticker = indices.ticker !== -1 ? row[indices.ticker]?.trim() : undefined
          const purchasePrice = indices.purchasePrice !== -1 ? Number(row[indices.purchasePrice]?.replace(',', '.')) : 0
          const currentPrice = indices.currentPrice !== -1 ? Number(row[indices.currentPrice]?.replace(',', '.')) : undefined
          const dividendPerShare = indices.dividendPerShare !== -1 ? Number(row[indices.dividendPerShare]?.replace(',', '.')) : 0
          const country = indices.country !== -1 ? row[indices.country]?.trim().toUpperCase() : 'DE'
          const currency = (indices.currency !== -1 ? row[indices.currency]?.trim().toUpperCase() : 'EUR') as Currency
          const sector = (indices.sector !== -1 ? row[indices.sector]?.trim().toLowerCase() : 'other') as Sector
          const paymentInterval = (indices.paymentInterval !== -1 ? row[indices.paymentInterval]?.trim().toLowerCase() : 'quarterly') as PaymentInterval

          // Erstelle Position
          const position: Omit<Position, 'id'> = {
            name,
            isin,
            ticker,
            quantity,
            purchasePrice,
            currentPrice: currentPrice && !isNaN(currentPrice) ? currentPrice : undefined,
            purchaseDate: new Date().toISOString().split('T')[0],
            country,
            currency,
            exchangeRate: currency === 'EUR' ? 1 : 1, // Könnte aus CSV kommen
            sector,
            dividendPerShare,
            paymentInterval,
            paymentDates: [], // Muss manuell nachgetragen werden
          }

          addPosition(position)
          success++
        } catch (err) {
          errors.push(`Zeile ${rowNum}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`)
          failed++
        }
      }

      setResult({ success, failed, errors: errors.slice(0, 10) }) // Max 10 Fehler anzeigen
    } catch (err) {
      setResult({
        success: 0,
        failed: 0,
        errors: [`Fehler beim Lesen der Datei: ${err instanceof Error ? err.message : 'Unbekannt'}`],
      })
    }

    setIsProcessing(false)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Portfolio aus CSV importieren
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              CSV-Datei mit deinem Portfolio hochladen
            </p>
            <p className="text-xs text-muted-foreground">
              Erwartete Spalten: Name, ISIN, Anzahl (Pflicht)<br />
              Optional: Ticker, Kaufpreis, Aktueller Kurs, Dividende, Land, Währung, Sektor
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing ? 'Verarbeite...' : 'CSV auswählen'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Ergebnis-Anzeige */}
        {result && (
          <div className="space-y-3">
            {result.success > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  {result.success} Position{result.success > 1 ? 'en' : ''} erfolgreich importiert
                </p>
              </div>
            )}

            {result.failed > 0 && (
              <div className="space-y-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {result.failed} Position{result.failed > 1 ? 'en' : ''} fehlgeschlagen
                  </p>
                </div>
                {result.errors.length > 0 && (
                  <div className="text-xs text-red-600 dark:text-red-400 space-y-1 ml-7">
                    {result.errors.map((error, i) => (
                      <p key={i}>• {error}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Beispiel CSV */}
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Beispiel CSV-Format anzeigen
          </summary>
          <pre className="mt-2 p-3 bg-accent rounded text-xs overflow-x-auto">
{`Name,ISIN,Ticker,Anzahl,Kaufpreis,Aktueller Kurs,Dividende,Land,Währung,Sektor,Intervall
Apple Inc.,US0378331005,AAPL,10,150.50,175.20,0.24,US,USD,tech,quarterly
Coca-Cola Co.,US1912161007,KO,25,55.00,58.50,0.44,US,USD,consumer,quarterly
SAP SE,DE0007164600,SAP,5,120.00,125.50,2.00,DE,EUR,tech,annual`}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}
