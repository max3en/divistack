// Stock Data Synchronization Service
// Synchronisiert lokale Datenbank mit Online-Quellen

import type { StockSearchResult } from './googleSheetsApi'
import { LOCAL_STOCKS } from './stockDatabase'

const SYNC_STORAGE_KEY = 'divistack-synced-stocks'
const LAST_SYNC_KEY = 'divistack-last-sync'
const SYNC_INTERVAL = 24 * 60 * 60 * 1000 // 24 Stunden

interface SyncedStock extends StockSearchResult {
  lastUpdated: string
}

/**
 * Holt aktuelle Daten von Yahoo Finance für alle Stocks
 */
async function fetchStockDataFromYahoo(tickers: string[]): Promise<Map<string, any>> {
  if (tickers.length === 0) return new Map()

  const stockData = new Map()

  // Verarbeite in Batches von 10
  const batchSize = 10
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize)
    const symbols = batch.join(',')

    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,dividendRate,dividendYield,currency,symbol`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const quotes = data.quoteResponse?.result || []

        quotes.forEach((quote: any) => {
          if (quote.symbol) {
            stockData.set(quote.symbol, {
              currentPrice: quote.regularMarketPrice,
              dividend: quote.dividendRate,
              dividendYield: quote.dividendYield,
              currency: quote.currency,
            })
          }
        })
      }

      // Kleine Verzögerung zwischen Batches
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.warn(`Batch sync failed for ${batch.join(', ')}:`, error)
    }
  }

  return stockData
}

/**
 * Synchronisiert alle Stocks aus der lokalen Datenbank
 */
export async function syncStockDatabase(): Promise<SyncedStock[]> {
  console.log('Starting stock database sync...')

  // Sammle alle Tickers
  const tickers = LOCAL_STOCKS.filter((s) => s.ticker).map((s) => s.ticker as string)

  // Hole aktuelle Daten von Yahoo Finance
  const yahooData = await fetchStockDataFromYahoo(tickers)

  // Aktualisiere Stocks mit neuen Daten
  const now = new Date().toISOString()
  const syncedStocks: SyncedStock[] = LOCAL_STOCKS.map((stock) => {
    const ticker = stock.ticker
    if (!ticker) {
      return { ...stock, lastUpdated: now }
    }

    const yahooInfo = yahooData.get(ticker)
    if (yahooInfo) {
      return {
        ...stock,
        currentPrice: yahooInfo.currentPrice || stock.currentPrice,
        dividend: yahooInfo.dividend || stock.dividend,
        lastUpdated: now,
      }
    }

    return { ...stock, lastUpdated: now }
  })

  // Speichere in localStorage
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncedStocks))
    localStorage.setItem(LAST_SYNC_KEY, now)
    console.log(`Sync completed: ${syncedStocks.length} stocks updated`)
  } catch (error) {
    console.error('Failed to save synced data:', error)
  }

  return syncedStocks
}

/**
 * Holt synchronisierte Daten aus localStorage
 */
export function getSyncedStocks(): SyncedStock[] | null {
  try {
    const stored = localStorage.getItem(SYNC_STORAGE_KEY)
    if (!stored) return null

    const synced = JSON.parse(stored) as SyncedStock[]
    return synced
  } catch (error) {
    console.error('Failed to load synced stocks:', error)
    return null
  }
}

/**
 * Gibt Zeitpunkt der letzten Synchronisation zurück
 */
export function getLastSyncTime(): Date | null {
  try {
    const stored = localStorage.getItem(LAST_SYNC_KEY)
    if (!stored) return null
    return new Date(stored)
  } catch (error) {
    return null
  }
}

/**
 * Prüft ob Sync nötig ist (älter als 24h)
 */
export function needsSync(): boolean {
  const lastSync = getLastSyncTime()
  if (!lastSync) return true

  const now = Date.now()
  const lastSyncTime = lastSync.getTime()
  return now - lastSyncTime > SYNC_INTERVAL
}

/**
 * Kombiniert lokale Datenbank mit synchronisierten Daten
 */
export function getMergedStockDatabase(): StockSearchResult[] {
  const synced = getSyncedStocks()

  if (!synced) {
    // Keine synchronisierten Daten: verwende lokale DB
    console.log('[StockDataSync] No synced data, using LOCAL_STOCKS with', LOCAL_STOCKS.length, 'stocks')
    return LOCAL_STOCKS
  }

  // WICHTIG: Prüfe ob die Anzahl der Stocks sich geändert hat
  // Wenn LOCAL_STOCKS mehr Einträge hat als synced, ist der Cache veraltet
  if (LOCAL_STOCKS.length > synced.length) {
    console.log('[StockDataSync] LOCAL_STOCKS has more entries than cache, clearing cache')
    console.log('[StockDataSync] LOCAL_STOCKS:', LOCAL_STOCKS.length, 'synced:', synced.length)
    // Cache ist veraltet - lösche ihn und verwende LOCAL_STOCKS
    localStorage.removeItem(SYNC_STORAGE_KEY)
    localStorage.removeItem(LAST_SYNC_KEY)
    return LOCAL_STOCKS
  }

  // Erstelle Map für schnellen Zugriff
  const syncedMap = new Map<string, SyncedStock>()
  synced.forEach((s) => syncedMap.set(s.isin, s))

  // Merge: Bevorzuge synchronisierte Daten, aber behalte ALLE LOCAL_STOCKS
  return LOCAL_STOCKS.map((local) => {
    const syncedVersion = syncedMap.get(local.isin)
    if (syncedVersion) {
      return {
        ...local,
        currentPrice: syncedVersion.currentPrice || local.currentPrice,
        dividend: syncedVersion.dividend || local.dividend,
      }
    }
    return local
  })
}

/**
 * Startet automatische Synchronisation
 */
export function initAutoSync() {
  // Prüfe beim Start ob Sync nötig ist
  if (needsSync()) {
    console.log('Initial sync needed...')
    syncStockDatabase().catch((error) => {
      console.error('Auto-sync failed:', error)
    })
  }

  // Wiederhole alle 24 Stunden
  setInterval(() => {
    if (needsSync()) {
      console.log('Periodic sync triggered...')
      syncStockDatabase().catch((error) => {
        console.error('Periodic sync failed:', error)
      })
    }
  }, SYNC_INTERVAL)
}
