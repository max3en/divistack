// Google Sheets API Integration für Aktiensuche
// Benötigt: Google Sheets API Key und Sheet ID
// Fallback: Lokale Datenbank wenn keine API Keys vorhanden

import type { Currency } from './types'
import { searchLocalStocks, getLocalStockByISIN } from './stockDatabase'

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || ''
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
const RANGE = 'Aktien!A2:J1000'

export interface StockSearchResult {
  name: string
  isin: string
  ticker: string
  country: string
  currency: Currency
  sector: string
  currentPrice?: number
  dividend?: number
  marketCap?: number
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 Stunden
const CACHE_PREFIX = 'stock-search-cache-'

/**
 * Sucht Aktien - zuerst in Google Sheets, dann lokale Datenbank als Fallback
 */
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  // Cache prüfen
  const cached = getFromCache(query)
  if (cached) {
    return cached
  }

  // Google Sheets API verfügbar?
  if (API_KEY && SHEET_ID) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.values && data.values.length > 0) {
        // Filter Ergebnisse nach query (Name oder ISIN)
        const searchLower = query.toLowerCase()
        const results = data.values
          .filter((row: string[]) =>
            row[0]?.toLowerCase().includes(searchLower) ||
            row[1]?.toLowerCase().includes(searchLower) ||
            row[2]?.toLowerCase().includes(searchLower)
          )
          .slice(0, 10) // Max 10 Ergebnisse
          .map((row: string[]) => ({
            name: row[0] || '',
            isin: row[1] || '',
            ticker: row[2] || '',
            country: row[3] || 'DE',
            currency: (row[4] || 'EUR') as Currency,
            sector: row[5] || 'other',
            currentPrice: row[6] ? parseFloat(row[6]) : undefined,
            dividend: row[7] ? parseFloat(row[7]) : undefined,
            marketCap: row[8] ? parseFloat(row[8]) : undefined,
          }))

        // In Cache speichern
        saveToCache(query, results)

        return results
      }
    } catch (error) {
      console.warn('Google Sheets API nicht erreichbar, nutze lokale Datenbank:', error)
    }
  }

  // Fallback: Lokale Datenbank
  console.info('Nutze lokale Aktien-Datenbank')
  const localResults = searchLocalStocks(query)

  // Auch lokale Ergebnisse cachen
  if (localResults.length > 0) {
    saveToCache(query, localResults)
  }

  return localResults
}

/**
 * Holt ein einzelnes Stock-Detail per ISIN
 */
export async function getStockByISIN(isin: string): Promise<StockSearchResult | null> {
  const results = await searchStocks(isin)
  const sheetResult = results.find(r => r.isin === isin)

  // Falls nicht in Sheets gefunden, probiere lokale DB
  if (!sheetResult) {
    return getLocalStockByISIN(isin)
  }

  return sheetResult
}

/**
 * Cache-Hilfsfunktionen
 */
function getFromCache(query: string): StockSearchResult[] | null {
  try {
    const cacheKey = CACHE_PREFIX + query.toLowerCase()
    const cached = localStorage.getItem(cacheKey)

    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)

    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return data
  } catch {
    return null
  }
}

function saveToCache(query: string, data: StockSearchResult[]): void {
  try {
    const cacheKey = CACHE_PREFIX + query.toLowerCase()
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.warn('Cache speichern fehlgeschlagen:', error)
  }
}

/**
 * Löscht den gesamten Search-Cache
 */
export function clearSearchCache(): void {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}
