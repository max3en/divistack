import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Position, TaxConfig } from '../lib/types'
import { storage } from '../lib/storage'
import { DEMO_POSITIONS } from '../lib/demoData'
import { getStockPrices } from '../lib/stockApi'
import { getLocalStockByISIN } from '../lib/stockDatabase'

interface PortfolioContextType {
  positions: Position[]
  taxConfig: TaxConfig
  addPosition: (position: Omit<Position, 'id'>) => void
  updatePosition: (id: string, position: Omit<Position, 'id'>) => void
  deletePosition: (id: string) => void
  updateTaxConfig: (config: TaxConfig) => void
  loadDemoData: () => void
  refreshPrices: () => Promise<void>
  lastSaved: Date | null
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<Position[]>([])
  const [taxConfig, setTaxConfig] = useState<TaxConfig>({ freeAllowance: 1000, freeAllowanceUsed: 0 })
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const saved = storage.getPositions()
    // Load demo data if no positions exist
    if (saved.length === 0) {
      const demoWithIds = DEMO_POSITIONS.map(p => ({ ...p, id: crypto.randomUUID() }))
      setPositions(demoWithIds)
      storage.savePositions(demoWithIds)
    } else {
      setPositions(saved)
    }
    setTaxConfig(storage.getTaxConfig())
  }, [])

  const addPosition = (position: Omit<Position, 'id'>) => {
    // Ergänze Ticker aus lokaler Datenbank falls nicht vorhanden
    let enrichedPosition = { ...position }
    if (!enrichedPosition.ticker && enrichedPosition.isin) {
      const stockInfo = getLocalStockByISIN(enrichedPosition.isin)
      if (stockInfo?.ticker) {
        enrichedPosition.ticker = stockInfo.ticker
        console.log(`[Portfolio] Added ticker ${stockInfo.ticker} for ISIN ${enrichedPosition.isin}`)
      }
    }

    const newPosition = { ...enrichedPosition, id: crypto.randomUUID() }
    const updated = [...positions, newPosition]
    setPositions(updated)
    storage.savePositions(updated)
    setLastSaved(new Date())

    // Trigger price refresh for new position
    setTimeout(() => refreshPrices(), 500)
  }

  const updatePosition = (id: string, position: Omit<Position, 'id'>) => {
    // Ergänze Ticker aus lokaler Datenbank falls nicht vorhanden
    let enrichedPosition = { ...position }
    if (!enrichedPosition.ticker && enrichedPosition.isin) {
      const stockInfo = getLocalStockByISIN(enrichedPosition.isin)
      if (stockInfo?.ticker) {
        enrichedPosition.ticker = stockInfo.ticker
        console.log(`[Portfolio] Added ticker ${stockInfo.ticker} for ISIN ${enrichedPosition.isin}`)
      }
    }

    const updated = positions.map(p => p.id === id ? { ...enrichedPosition, id } : p)
    setPositions(updated)
    storage.savePositions(updated)
    setLastSaved(new Date())

    // Trigger price refresh
    setTimeout(() => refreshPrices(), 500)
  }

  const deletePosition = (id: string) => {
    const updated = positions.filter(p => p.id !== id)
    setPositions(updated)
    storage.savePositions(updated)
    setLastSaved(new Date())
  }

  const updateTaxConfig = (config: TaxConfig) => {
    setTaxConfig(config)
    storage.saveTaxConfig(config)
    setLastSaved(new Date())
  }

  const loadDemoData = () => {
    const demoWithIds = DEMO_POSITIONS.map(p => ({ ...p, id: crypto.randomUUID() }))
    setPositions(demoWithIds)
    storage.savePositions(demoWithIds)
  }

  const refreshPrices = async () => {
    // Use functional setState to get current positions
    setPositions((currentPositions) => {
      if (currentPositions.length === 0) return currentPositions

      console.log('[Portfolio] Starting price refresh for', currentPositions.length, 'positions')

      // Ergänze fehlende Tickers aus lokaler Datenbank
      const enrichedPositions = currentPositions.map((p) => {
        if (!p.ticker && p.isin) {
          const stockInfo = getLocalStockByISIN(p.isin)
          if (stockInfo?.ticker) {
            console.log(`[Portfolio] Enriching ${p.name} with ticker ${stockInfo.ticker}`)
            return { ...p, ticker: stockInfo.ticker }
          }
        }
        return p
      })

      // Sammle alle Tickers
      const tickers = enrichedPositions
        .filter((p) => p.ticker)
        .map((p) => p.ticker as string)

      if (tickers.length === 0) {
        console.log('[Portfolio] No tickers found for price refresh')
        return currentPositions
      }

      console.log('[Portfolio] Fetching prices for:', tickers)

      // Trigger async price fetch (don't wait for it in setState)
      getStockPrices(tickers)
        .then((priceMap) => {
          const now = new Date().toISOString()

          setPositions((pos) => {
            const updated = pos.map((p) => {
              if (!p.ticker) return p

              const newPrice = priceMap.get(p.ticker)
              if (!newPrice) {
                console.log(`[Portfolio] No price found for ${p.ticker}`)
                return p
              }

              console.log(`[Portfolio] Updated price for ${p.ticker}: ${newPrice}`)
              return {
                ...p,
                currentPrice: newPrice,
                lastPriceUpdate: now,
              }
            })

            storage.savePositions(updated)
            return updated
          })

          setLastSaved(new Date())
        })
        .catch((error) => {
          console.error('[Portfolio] Price refresh failed:', error)
        })

      // Return enriched positions immediately (with tickers but without new prices yet)
      return enrichedPositions
    })
  }

  // Auto-refresh prices on mount and every 5 minutes
  useEffect(() => {
    // Trigger initial refresh after 2 seconds (give time for data to load)
    const initialTimeout = setTimeout(() => {
      refreshPrices()
    }, 2000)

    // Then refresh every 5 minutes
    const interval = setInterval(() => {
      refreshPrices()
    }, 5 * 60 * 1000) // 5 Minuten

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, []) // Only run once on mount, not on positions.length change

  return (
    <PortfolioContext.Provider value={{
      positions,
      taxConfig,
      addPosition,
      updatePosition,
      deletePosition,
      updateTaxConfig,
      loadDemoData,
      refreshPrices,
      lastSaved,
    }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider')
  }
  return context
}
