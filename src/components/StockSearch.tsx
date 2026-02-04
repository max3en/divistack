import { useState, useEffect, useCallback } from 'react'
import { Input } from './ui/input'
import { searchStocks, StockSearchResult } from '../lib/googleSheetsApi'
import { searchStocksHybrid } from '../lib/stockApi'
import { Search, Loader2, X, Globe } from 'lucide-react'
import { Button } from './ui/button'

interface StockSearchProps {
  onSelect: (stock: StockSearchResult) => void
  onClose?: () => void
}

export function StockSearch({ onSelect, onClose }: StockSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search with live API
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        // Versuche zuerst Google Sheets (falls konfiguriert)
        let stocks: StockSearchResult[] = []

        try {
          stocks = await searchStocks(query)
        } catch (sheetError) {
          console.log('Google Sheets nicht verfügbar, verwende Live-API')
        }

        // Falls keine Google Sheets Ergebnisse: Live-API verwenden
        if (stocks.length === 0) {
          stocks = await searchStocksHybrid(query)
        }

        setResults(stocks)

        if (stocks.length === 0) {
          setError('Keine Ergebnisse gefunden')
        }
      } catch (err) {
        setError('Fehler bei der Suche')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (stock: StockSearchResult) => {
    onSelect(stock)
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative mb-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Aktie suchen (Name, ISIN oder Ticker)..."
          className="pl-10 pr-10"
          autoFocus
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="mt-2"
        >
          Abbrechen
        </Button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Suche läuft...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Tipp: Google Sheets API Key & Sheet ID in .env konfigurieren
          </p>
        </div>
      )}

      {/* Results Dropdown */}
      {results.length > 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
          {results.map((stock) => (
            <button
              key={stock.isin}
              onClick={() => handleSelect(stock)}
              className="w-full p-4 hover:bg-muted text-left transition-colors border-b last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{stock.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stock.isin} • {stock.ticker}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {stock.country}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground">
                      {stock.currency}
                    </span>
                  </div>
                </div>
                {stock.currentPrice && (
                  <div className="text-right ml-4">
                    <div className="font-medium text-foreground">
                      {stock.currentPrice.toFixed(2)} {stock.currency}
                    </div>
                    {stock.dividend && (
                      <div className="text-sm text-green-600 mt-1">
                        Div: {stock.dividend.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
        <Globe className="h-3 w-3" />
        Live-Suche mit aktuellen Kursen über Yahoo Finance & lokale Datenbank
      </p>
    </div>
  )
}
