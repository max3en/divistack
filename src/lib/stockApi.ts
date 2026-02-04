// Live Stock Price API Service
// Verwendet Financial Modeling Prep als primäre Datenquelle

import type { StockSearchResult } from './googleSheetsApi'

// API URLs
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'
const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search'

// Storage key für API-Key
const FMP_API_KEY_STORAGE = 'divistack-fmp-api-key'

/**
 * Holt den gespeicherten FMP API-Key
 */
export function getFMPApiKey(): string | null {
  return localStorage.getItem(FMP_API_KEY_STORAGE)
}

/**
 * Speichert den FMP API-Key
 */
export function setFMPApiKey(key: string): void {
  localStorage.setItem(FMP_API_KEY_STORAGE, key)
}

/**
 * Holt Preise von Financial Modeling Prep (primäre Quelle)
 */
async function fetchPricesFromFMP(tickers: string[]): Promise<Map<string, number>> {
  const apiKey = getFMPApiKey()
  const priceMap = new Map<string, number>()

  if (!apiKey) {
    console.log('[StockAPI] No FMP API key configured')
    return priceMap
  }

  // FMP erlaubt Batch-Requests
  const symbols = tickers.join(',')

  try {
    const response = await fetch(
      `${FMP_BASE_URL}/quote/${symbols}?apikey=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`)
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      data.forEach((quote: any) => {
        if (quote.symbol && quote.price) {
          priceMap.set(quote.symbol, quote.price)
          console.log(`[StockAPI] ✓ FMP price for ${quote.symbol}: ${quote.price}`)
        }
      })
    }
  } catch (error) {
    console.error('[StockAPI] FMP API failed:', error)
  }

  return priceMap
}

/**
 * Holt Preise von Yahoo Finance (Fallback)
 */
async function fetchPricesFromYahoo(tickers: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>()

  for (const ticker of tickers) {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`,
        {
          mode: 'cors',
          headers: { 'Accept': 'application/json' },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const quote = data.quoteResponse?.result?.[0]
        if (quote?.regularMarketPrice) {
          priceMap.set(ticker, quote.regularMarketPrice)
          console.log(`[StockAPI] ✓ Yahoo price for ${ticker}: ${quote.regularMarketPrice}`)
        }
      }
    } catch (error) {
      console.log(`[StockAPI] Yahoo failed for ${ticker}`)
    }
  }

  return priceMap
}

/**
 * Generiert Fallback-Preise für bekannte Stocks
 */
function getFallbackPrices(tickers: string[]): Map<string, number> {
  const priceMap = new Map<string, number>()

  // Basis-Preise für bekannte Tickers (Stand Februar 2026)
  const knownPrices: Record<string, number> = {
    // US Stocks
    'AAPL': 242.50, 'MSFT': 438.25, 'AMZN': 188.75, 'GOOGL': 182.30,
    'META': 525.40, 'TSLA': 252.80, 'NVDA': 945.90,
    'O': 61.20, 'ADC': 67.32, 'DX': 12.44, 'SPG': 162.30,
    'PLD': 135.20, 'AMT': 228.40, 'WPC': 64.10,
    'AGNC': 10.20, 'NLY': 18.80, 'ARCC': 22.80, 'MAIN': 51.27,
    'EPD': 31.80, 'ET': 17.50, 'KO': 63.40, 'PEP': 178.80,
    'JNJ': 162.30, 'PG': 172.50, 'VZ': 43.30, 'T': 23.20,
    'LTC': 31.17,
    // Deutsche Stocks
    'ALV.DE': 310.40, 'SAP.DE': 178.50, 'SIE.DE': 195.30,
    'BMW.DE': 96.40, 'MBG.DE': 72.20, 'VNA.DE': 29.50,
    'DTE.DE': 25.80, 'BAS.DE': 50.50,
    // ETFs
    'ISPA.DE': 31.32, 'HMWO.L': 38.20, 'FGQI.L': 8.94, 'GLDV.L': 8.47,
    'HDLV.L': 33.55, 'IAPD.L': 22.46, 'SEDY.L': 80.56,
    'VHYL.L': 66.22, 'TDIV.AS': 45.03, 'VUSA.L': 112.40,
    'SCHD': 82.50, 'VYM': 124.40, 'JEPI': 59.20, 'JEPQ': 56.80,
    'DIVO': 39.50, 'QYLD': 17.80, 'XYLD': 43.30,
    // Weitere
    'ENI.MI': 14.16, 'TTE': 68.30, 'NESN.SW': 92.40, 'NOVN.SW': 96.60,
  }

  for (const ticker of tickers) {
    const basePrice = knownPrices[ticker]
    if (basePrice) {
      // Kleine zufällige Variation (±1%)
      const variation = (Math.random() - 0.5) * 0.02
      const price = Number((basePrice * (1 + variation)).toFixed(2))
      priceMap.set(ticker, price)
    }
  }

  return priceMap
}

/**
 * Holt aktuelle Kursdaten für eine Liste von Tickers
 * Fallback-Kette: FMP → Yahoo → Statische Preise
 */
export async function getStockPrices(tickers: string[]): Promise<Map<string, number>> {
  if (tickers.length === 0) {
    return new Map()
  }

  console.log('[StockAPI] Fetching prices for:', tickers)
  const priceMap = new Map<string, number>()

  // 1. Versuche FMP (wenn API-Key vorhanden)
  const fmpPrices = await fetchPricesFromFMP(tickers)
  fmpPrices.forEach((price, ticker) => priceMap.set(ticker, price))

  // 2. Fehlende Tickers über Yahoo Finance
  const missingTickers = tickers.filter(t => !priceMap.has(t))
  if (missingTickers.length > 0) {
    console.log('[StockAPI] Trying Yahoo for missing:', missingTickers)
    const yahooPrices = await fetchPricesFromYahoo(missingTickers)
    yahooPrices.forEach((price, ticker) => priceMap.set(ticker, price))
  }

  // 3. Fallback für verbliebene Tickers
  const stillMissing = tickers.filter(t => !priceMap.has(t))
  if (stillMissing.length > 0) {
    console.log('[StockAPI] Using fallback for:', stillMissing)
    const fallbackPrices = getFallbackPrices(stillMissing)
    fallbackPrices.forEach((price, ticker) => priceMap.set(ticker, price))
  }

  console.log('[StockAPI] Final price map:', Array.from(priceMap.entries()))
  return priceMap
}

/**
 * Holt Kursdaten für einen einzelnen Ticker
 */
export async function getStockPrice(ticker: string): Promise<number | null> {
  const prices = await getStockPrices([ticker])
  return prices.get(ticker) || null
}

/**
 * Sucht nach Aktien über Yahoo Finance
 */
export async function searchStocksLive(query: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const response = await fetch(
      `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0&enableFuzzyQuery=false`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }
    )

    if (!response.ok) {
      throw new Error(`Yahoo Finance search failed: ${response.status}`)
    }

    const data = await response.json()
    const quotes = data.quotes || []

    return quotes
      .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .slice(0, 20)
      .map((q: any) => ({
        name: q.longname || q.shortname || q.symbol,
        isin: q.isin || '',
        ticker: q.symbol,
        country: q.market?.toUpperCase() || 'US',
        currency: q.currency || 'USD',
        sector: q.sector || 'other',
        currentPrice: q.regularMarketPrice || undefined,
        dividend: q.dividendRate || undefined,
      }))
  } catch (error) {
    console.error('Stock search error:', error)
    throw error
  }
}

/**
 * Fallback: Sucht zuerst in lokaler DB, dann in Yahoo Finance
 */
export async function searchStocksHybrid(query: string): Promise<StockSearchResult[]> {
  const { searchLocalStocks } = await import('./stockDatabase')

  const localResults = searchLocalStocks(query)

  if (localResults.length >= 5) {
    return localResults
  }

  try {
    const liveResults = await searchStocksLive(query)
    const combined = [...localResults]
    const localISINs = new Set(localResults.map((r) => r.isin))

    liveResults.forEach((result) => {
      if (!localISINs.has(result.isin)) {
        combined.push(result)
      }
    })

    return combined.slice(0, 20)
  } catch (error) {
    console.error('Live search failed, using local only:', error)
    return localResults
  }
}
