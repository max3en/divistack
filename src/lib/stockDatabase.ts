// Lokale Aktien-Datenbank als Fallback
// Erweitere diese Liste nach Bedarf

import type { StockSearchResult } from './googleSheetsApi'
import { getMergedStockDatabase } from './stockDataSync'

export const LOCAL_STOCKS: StockSearchResult[] = [
  // US Tech
  { name: 'Apple Inc.', isin: 'US0378331005', ticker: 'AAPL', country: 'US', currency: 'USD', sector: 'tech' },
  { name: 'Microsoft Corporation', isin: 'US5949181045', ticker: 'MSFT', country: 'US', currency: 'USD', sector: 'tech' },
  { name: 'Amazon.com Inc.', isin: 'US0231351067', ticker: 'AMZN', country: 'US', currency: 'USD', sector: 'consumer' },
  { name: 'Alphabet Inc. Class A', isin: 'US02079K3059', ticker: 'GOOGL', country: 'US', currency: 'USD', sector: 'tech' },
  { name: 'Meta Platforms Inc.', isin: 'US30303M1027', ticker: 'META', country: 'US', currency: 'USD', sector: 'tech' },
  { name: 'Tesla Inc.', isin: 'US88160R1014', ticker: 'TSLA', country: 'US', currency: 'USD', sector: 'consumer' },
  { name: 'NVIDIA Corporation', isin: 'US67066G1040', ticker: 'NVDA', country: 'US', currency: 'USD', sector: 'tech' },
  { name: 'Netflix Inc.', isin: 'US64110L1061', ticker: 'NFLX', country: 'US', currency: 'USD', sector: 'consumer' },
  { name: 'Adobe Inc.', isin: 'US00724F1012', ticker: 'ADBE', country: 'US', currency: 'USD', sector: 'tech' },
  { name: 'Intel Corporation', isin: 'US4581401001', ticker: 'INTC', country: 'US', currency: 'USD', sector: 'tech' },

  // US Dividenden-Aristokraten
  { name: 'The Coca-Cola Company', isin: 'US1912161007', ticker: 'KO', country: 'US', currency: 'USD', sector: 'consumer', dividend: 0.485 },
  { name: 'Johnson & Johnson', isin: 'US4781601046', ticker: 'JNJ', country: 'US', currency: 'USD', sector: 'health', dividend: 1.19 },
  { name: 'Procter & Gamble Co.', isin: 'US7427181091', ticker: 'PG', country: 'US', currency: 'USD', sector: 'consumer', dividend: 0.9407 },
  { name: 'PepsiCo Inc.', isin: 'US7134481081', ticker: 'PEP', country: 'US', currency: 'USD', sector: 'consumer', dividend: 1.265 },
  { name: 'McDonald\'s Corporation', isin: 'US5801351017', ticker: 'MCD', country: 'US', currency: 'USD', sector: 'consumer', dividend: 1.67 },
  { name: 'Walmart Inc.', isin: 'US9311421039', ticker: 'WMT', country: 'US', currency: 'USD', sector: 'consumer', dividend: 0.83 },
  { name: 'Visa Inc.', isin: 'US92826C8394', ticker: 'V', country: 'US', currency: 'USD', sector: 'finance', dividend: 0.52 },
  { name: 'Mastercard Inc.', isin: 'US57636Q1040', ticker: 'MA', country: 'US', currency: 'USD', sector: 'finance', dividend: 0.66 },

  // US Energie & Industrie
  { name: 'Exxon Mobil Corporation', isin: 'US30231G1022', ticker: 'XOM', country: 'US', currency: 'USD', sector: 'energy', dividend: 0.95 },
  { name: 'Chevron Corporation', isin: 'US1667641005', ticker: 'CVX', country: 'US', currency: 'USD', sector: 'energy', dividend: 1.63 },
  { name: 'The Boeing Company', isin: 'US0970231058', ticker: 'BA', country: 'US', currency: 'USD', sector: 'industry' },
  { name: 'Caterpillar Inc.', isin: 'US1491231015', ticker: 'CAT', country: 'US', currency: 'USD', sector: 'industry', dividend: 1.30 },

  // Deutsche Aktien (DAX)
  { name: 'Allianz SE', isin: 'DE0008404005', ticker: 'ALV.DE', country: 'DE', currency: 'EUR', sector: 'finance', dividend: 13.80 },
  { name: 'SAP SE', isin: 'DE0007164600', ticker: 'SAP.DE', country: 'DE', currency: 'EUR', sector: 'tech', dividend: 2.20 },
  { name: 'Siemens AG', isin: 'DE0007236101', ticker: 'SIE.DE', country: 'DE', currency: 'EUR', sector: 'industry', dividend: 5.00 },
  { name: 'Bayerische Motoren Werke AG', isin: 'DE0005190003', ticker: 'BMW.DE', country: 'DE', currency: 'EUR', sector: 'consumer', dividend: 6.00 },
  { name: 'Mercedes-Benz Group AG', isin: 'DE0007100000', ticker: 'MBG.DE', country: 'DE', currency: 'EUR', sector: 'consumer', dividend: 5.30 },
  { name: 'Volkswagen AG', isin: 'DE0007664005', ticker: 'VOW3.DE', country: 'DE', currency: 'EUR', sector: 'consumer', dividend: 9.06 },
  { name: 'Deutsche Telekom AG', isin: 'DE0005557508', ticker: 'DTE.DE', country: 'DE', currency: 'EUR', sector: 'telecom', dividend: 0.77 },
  { name: 'Deutsche Post AG', isin: 'DE0005552004', ticker: 'DPW.DE', country: 'DE', currency: 'EUR', sector: 'industry', dividend: 1.85 },
  { name: 'Münchener Rück AG', isin: 'DE0008430026', ticker: 'MUV2.DE', country: 'DE', currency: 'EUR', sector: 'finance', dividend: 15.00 },
  { name: 'BASF SE', isin: 'DE000BASF111', ticker: 'BAS.DE', country: 'DE', currency: 'EUR', sector: 'materials', dividend: 3.40 },
  { name: 'E.ON SE', isin: 'DE000ENAG999', ticker: 'EOAN.DE', country: 'DE', currency: 'EUR', sector: 'utilities', dividend: 0.53 },
  { name: 'RWE AG', isin: 'DE0007037129', ticker: 'RWE.DE', country: 'DE', currency: 'EUR', sector: 'utilities', dividend: 1.00 },

  // Schweizer Aktien
  { name: 'Nestlé S.A.', isin: 'CH0038863350', ticker: 'NESN.SW', country: 'CH', currency: 'CHF', sector: 'consumer', dividend: 3.00 },
  { name: 'Novartis AG', isin: 'CH0012005267', ticker: 'NOVN.SW', country: 'CH', currency: 'CHF', sector: 'health', dividend: 3.30 },
  { name: 'Roche Holding AG', isin: 'CH0012032048', ticker: 'ROG.SW', country: 'CH', currency: 'CHF', sector: 'health', dividend: 9.60 },

  // UK Aktien
  { name: 'British American Tobacco p.l.c.', isin: 'GB0002875804', ticker: 'BATS.L', country: 'GB', currency: 'GBP', sector: 'consumer', dividend: 2.30 },
  { name: 'Unilever PLC', isin: 'GB00B10RZP78', ticker: 'ULVR.L', country: 'GB', currency: 'GBP', sector: 'consumer', dividend: 1.48 },
  { name: 'BP p.l.c.', isin: 'GB0007980591', ticker: 'BP.L', country: 'GB', currency: 'GBP', sector: 'energy', dividend: 0.28 },
  { name: 'Shell plc', isin: 'GB00BP6MXD84', ticker: 'SHEL.L', country: 'GB', currency: 'GBP', sector: 'energy', dividend: 0.66 },

  // ETFs
  { name: 'iShares MSCI World UCITS ETF', isin: 'IE00B4L5Y983', ticker: 'IWDA.AS', country: 'IE', currency: 'EUR', sector: 'other', dividend: 1.20 },
  { name: 'iShares Core MSCI EM IMI UCITS ETF', isin: 'IE00BKM4GZ66', ticker: 'EIMI.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 2.80 },
  { name: 'Vanguard FTSE All-World UCITS ETF', isin: 'IE00B3RBWM25', ticker: 'VWRL.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 1.80 },
  { name: 'iShares STOXX Europe 600 UCITS ETF', isin: 'DE0002635307', ticker: 'EXSA.DE', country: 'DE', currency: 'EUR', sector: 'other', dividend: 2.00 },
  { name: 'iShares Core S&P 500 UCITS ETF', isin: 'IE00B5BMR087', ticker: 'CSPX.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 1.40 },
  { name: 'Vanguard FTSE Developed World UCITS ETF', isin: 'IE00BK5BQT80', ticker: 'VDEV.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 1.60 },

  // REITs USA
  { name: 'Realty Income Corporation', isin: 'US7561091049', ticker: 'O', country: 'US', currency: 'USD', sector: 'realestate', dividend: 3.10 },
  { name: 'Simon Property Group Inc.', isin: 'US8288061091', ticker: 'SPG', country: 'US', currency: 'USD', sector: 'realestate', dividend: 7.40 },
  { name: 'Prologis Inc.', isin: 'US74340W1036', ticker: 'PLD', country: 'US', currency: 'USD', sector: 'realestate', dividend: 3.28 },
  { name: 'American Tower Corporation', isin: 'US03027X1000', ticker: 'AMT', country: 'US', currency: 'USD', sector: 'realestate', dividend: 6.20 },
  { name: 'Public Storage', isin: 'US74460D1090', ticker: 'PSA', country: 'US', currency: 'USD', sector: 'realestate', dividend: 10.00 },
  { name: 'Welltower Inc.', isin: 'US95040Q1040', ticker: 'WELL', country: 'US', currency: 'USD', sector: 'realestate', dividend: 2.44 },
  { name: 'Equity Residential', isin: 'US2971781057', ticker: 'EQR', country: 'US', currency: 'USD', sector: 'realestate', dividend: 2.64 },
  { name: 'AvalonBay Communities Inc.', isin: 'US0534841012', ticker: 'AVB', country: 'US', currency: 'USD', sector: 'realestate', dividend: 9.24 },
  { name: 'Digital Realty Trust Inc.', isin: 'US2538681030', ticker: 'DLR', country: 'US', currency: 'USD', sector: 'realestate', dividend: 4.88 },
  { name: 'Crown Castle Inc.', isin: 'US22822V1017', ticker: 'CCI', country: 'US', currency: 'USD', sector: 'realestate', dividend: 6.08 },

  // Weitere US REITs
  { name: 'Agree Realty Corporation', isin: 'US0084921008', ticker: 'ADC', country: 'US', currency: 'USD', sector: 'realestate', dividend: 2.88 },
  { name: 'W.P. Carey Inc.', isin: 'US92936U1097', ticker: 'WPC', country: 'US', currency: 'USD', sector: 'realestate', dividend: 4.20 },
  { name: 'STAG Industrial Inc.', isin: 'US85254J1025', ticker: 'STAG', country: 'US', currency: 'USD', sector: 'realestate', dividend: 1.56 },
  { name: 'National Retail Properties Inc.', isin: 'US6374171063', ticker: 'NNN', country: 'US', currency: 'USD', sector: 'realestate', dividend: 2.28 },
  { name: 'Federal Realty Investment Trust', isin: 'US3137451015', ticker: 'FRT', country: 'US', currency: 'USD', sector: 'realestate', dividend: 4.36 },
  { name: 'Ventas Inc.', isin: 'US92276F1003', ticker: 'VTR', country: 'US', currency: 'USD', sector: 'realestate', dividend: 1.80 },
  { name: 'Medical Properties Trust Inc.', isin: 'US58463J3041', ticker: 'MPW', country: 'US', currency: 'USD', sector: 'realestate', dividend: 1.20 },
  { name: 'Iron Mountain Inc.', isin: 'US46284V1017', ticker: 'IRM', country: 'US', currency: 'USD', sector: 'realestate', dividend: 2.59 },
  { name: 'Gaming and Leisure Properties Inc.', isin: 'US36467J1088', ticker: 'GLPI', country: 'US', currency: 'USD', sector: 'realestate', dividend: 2.80 },
  { name: 'VICI Properties Inc.', isin: 'US92564C1009', ticker: 'VICI', country: 'US', currency: 'USD', sector: 'realestate', dividend: 1.60 },

  // Mortgage REITs
  { name: 'Dynex Capital Inc.', isin: 'US2680382067', ticker: 'DX', country: 'US', currency: 'USD', sector: 'realestate', dividend: 1.80 },
  { name: 'AGNC Investment Corp.', isin: 'US00123Q1040', ticker: 'AGNC', country: 'US', currency: 'USD', sector: 'realestate', dividend: 1.44 },
  { name: 'Annaly Capital Management Inc.', isin: 'US0357109087', ticker: 'NLY', country: 'US', currency: 'USD', sector: 'realestate', dividend: 2.60 },
  { name: 'New York Mortgage Trust Inc.', isin: 'US6491666063', ticker: 'NYMT', country: 'US', currency: 'USD', sector: 'realestate', dividend: 0.80 },
  { name: 'Two Harbors Investment Corp.', isin: 'US90187B1017', ticker: 'TWO', country: 'US', currency: 'USD', sector: 'realestate', dividend: 1.74 },

  // Europäische Energie
  { name: 'Eni S.p.A.', isin: 'IT0003132476', ticker: 'ENI.MI', country: 'IT', currency: 'EUR', sector: 'energy', dividend: 0.94 },
  { name: 'TotalEnergies SE', isin: 'FR0000120271', ticker: 'TTE', country: 'FR', currency: 'EUR', sector: 'energy', dividend: 2.90 },
  { name: 'Equinor ASA', isin: 'NO0010096985', ticker: 'EQNR', country: 'NO', currency: 'NOK', sector: 'energy', dividend: 1.10 },
  { name: 'OMV AG', isin: 'AT0000743059', ticker: 'OMV.VI', country: 'AT', currency: 'EUR', sector: 'energy', dividend: 2.25 },

  // Weitere US Dividenden-Aristokraten
  { name: '3M Company', isin: 'US88579Y1010', ticker: 'MMM', country: 'US', currency: 'USD', sector: 'industry', dividend: 6.04 },
  { name: 'AbbVie Inc.', isin: 'US00287Y1092', ticker: 'ABBV', country: 'US', currency: 'USD', sector: 'health', dividend: 5.92 },
  { name: 'AT&T Inc.', isin: 'US00206R1023', ticker: 'T', country: 'US', currency: 'USD', sector: 'telecom', dividend: 1.11 },
  { name: 'Verizon Communications Inc.', isin: 'US92343V1044', ticker: 'VZ', country: 'US', currency: 'USD', sector: 'telecom', dividend: 2.61 },
  { name: 'Altria Group Inc.', isin: 'US02209S1033', ticker: 'MO', country: 'US', currency: 'USD', sector: 'consumer', dividend: 3.76 },
  { name: 'Philip Morris International Inc.', isin: 'US7181721090', ticker: 'PM', country: 'US', currency: 'USD', sector: 'consumer', dividend: 5.20 },
  { name: 'General Mills Inc.', isin: 'US3703341046', ticker: 'GIS', country: 'US', currency: 'USD', sector: 'consumer', dividend: 3.12 },
  { name: 'Kraft Heinz Company', isin: 'US5007541064', ticker: 'KHC', country: 'US', currency: 'USD', sector: 'consumer', dividend: 1.60 },
  { name: 'Kimberly-Clark Corporation', isin: 'US4943681035', ticker: 'KMB', country: 'US', currency: 'USD', sector: 'consumer', dividend: 4.60 },
  { name: 'Colgate-Palmolive Company', isin: 'US1941621039', ticker: 'CL', country: 'US', currency: 'USD', sector: 'consumer', dividend: 1.88 },

  // Banken & Versicherungen
  { name: 'JPMorgan Chase & Co.', isin: 'US46625H1005', ticker: 'JPM', country: 'US', currency: 'USD', sector: 'finance', dividend: 4.00 },
  { name: 'Bank of America Corporation', isin: 'US0605051046', ticker: 'BAC', country: 'US', currency: 'USD', sector: 'finance', dividend: 0.96 },
  { name: 'Wells Fargo & Company', isin: 'US9497461015', ticker: 'WFC', country: 'US', currency: 'USD', sector: 'finance', dividend: 1.20 },
  { name: 'Citigroup Inc.', isin: 'US1729674242', ticker: 'C', country: 'US', currency: 'USD', sector: 'finance', dividend: 2.04 },
  { name: 'The Blackstone Group Inc.', isin: 'US09260D1072', ticker: 'BX', country: 'US', currency: 'USD', sector: 'finance', dividend: 4.00 },

  // BDCs (Business Development Companies)
  { name: 'Ares Capital Corporation', isin: 'US0404131064', ticker: 'ARCC', country: 'US', currency: 'USD', sector: 'finance', dividend: 1.92 },
  { name: 'Main Street Capital Corporation', isin: 'US56035L1044', ticker: 'MAIN', country: 'US', currency: 'USD', sector: 'finance', dividend: 3.06 },
  { name: 'Prospect Capital Corporation', isin: 'US74348T1025', ticker: 'PSEC', country: 'US', currency: 'USD', sector: 'finance', dividend: 0.72 },

  // MLPs & Energie-Infrastruktur
  { name: 'Enterprise Products Partners L.P.', isin: 'US29379V1008', ticker: 'EPD', country: 'US', currency: 'USD', sector: 'energy', dividend: 1.90 },
  { name: 'Energy Transfer LP', isin: 'US29273V1008', ticker: 'ET', country: 'US', currency: 'USD', sector: 'energy', dividend: 1.22 },
  { name: 'Magellan Midstream Partners L.P.', isin: 'US55903V1008', ticker: 'MMP', country: 'US', currency: 'USD', sector: 'energy', dividend: 4.32 },
  { name: 'Williams Companies Inc.', isin: 'US9694571004', ticker: 'WMB', country: 'US', currency: 'USD', sector: 'energy', dividend: 1.75 },

  // Kanadische Dividenden-Aktien
  { name: 'Enbridge Inc.', isin: 'CA29250N1050', ticker: 'ENB.TO', country: 'CA', currency: 'CAD', sector: 'energy', dividend: 3.44 },
  { name: 'TC Energy Corporation', isin: 'CA87807B1076', ticker: 'TRP.TO', country: 'CA', currency: 'CAD', sector: 'energy', dividend: 3.48 },
  { name: 'Bank of Nova Scotia', isin: 'CA0641491075', ticker: 'BNS.TO', country: 'CA', currency: 'CAD', sector: 'finance', dividend: 4.00 },
  { name: 'Royal Bank of Canada', isin: 'CA7800371014', ticker: 'RY.TO', country: 'CA', currency: 'CAD', sector: 'finance', dividend: 5.00 },
  { name: 'BCE Inc.', isin: 'CA05534B7604', ticker: 'BCE.TO', country: 'CA', currency: 'CAD', sector: 'telecom', dividend: 3.51 },

  // Asiatische Dividenden-Aktien
  { name: 'China Mobile Limited', isin: 'HK0941009539', ticker: '0941.HK', country: 'HK', currency: 'HKD', sector: 'telecom', dividend: 2.50 },
  { name: 'Toyota Motor Corporation', isin: 'JP3633400001', ticker: '7203.T', country: 'JP', currency: 'JPY', sector: 'consumer', dividend: 120 },

  // REITs Europa
  { name: 'Vonovia SE', isin: 'DE000A1ML7J1', ticker: 'VNA.DE', country: 'DE', currency: 'EUR', sector: 'realestate', dividend: 0.90 },
  { name: 'Aroundtown SA', isin: 'LU1673108939', ticker: 'AT1.DE', country: 'DE', currency: 'EUR', sector: 'realestate', dividend: 0.10 },
  { name: 'LEG Immobilien SE', isin: 'DE000LEG1110', ticker: 'LEG.DE', country: 'DE', currency: 'EUR', sector: 'realestate', dividend: 3.50 },

  // Additional US REITs
  { name: 'LTC Properties Inc.', isin: 'US5021751020', ticker: 'LTC', country: 'US', currency: 'USD', sector: 'realestate', dividend: 2.28 },

  // ETFs - Dividend Focus
  { name: 'iShares Global Select Dividend 100 UCITS ETF', isin: 'DE000A0F5UH1', ticker: 'ISPA.DE', country: 'DE', currency: 'EUR', sector: 'other', dividend: 1.00 },
  { name: 'HSBC MSCI World UCITS ETF', isin: 'IE00B4X9L533', ticker: 'HMWO.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 0.40 },
  { name: 'Fidelity Global Quality Income UCITS ETF', isin: 'IE00BYXVGZ48', ticker: 'FGQI.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 0.68 },
  { name: 'GlxEtfs-Supdiv Dld', isin: 'IE00777FRP95', ticker: 'GLDV.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 0.50 },
  { name: 'Invesco S&P 500 High Dividend Low Volatility UCITS ETF', isin: 'IE0DBWTN6Y99', ticker: 'HDLV.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 1.40 },
  { name: 'iShares Asia Pacific Dividend UCITS ETF', isin: 'IE00B14X4T88', ticker: 'IAPD.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 0.80 },
  { name: 'iShares EM Dividend UCITS ETF', isin: 'IE00B2NPKV68', ticker: 'SEDY.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 1.20 },
  { name: 'Vanguard FTSE All-World High Dividend Yield UCITS ETF', isin: 'IE00B8GKDB10', ticker: 'VHYL.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 1.80 },
  { name: 'VanEck Morningstar Developed Markets Dividend Leaders UCITS ETF', isin: 'NL0011683594', ticker: 'TDIV.AS', country: 'NL', currency: 'EUR', sector: 'other', dividend: 0.76 },
  { name: 'Vanguard S&P 500 UCITS ETF', isin: 'IE00B3XXRP09', ticker: 'VUSA.L', country: 'IE', currency: 'USD', sector: 'other', dividend: 1.04 },
]

/**
 * Durchsucht die lokale Datenbank (mit synchronisierten Daten)
 */
export function searchLocalStocks(query: string): StockSearchResult[] {
  if (!query || query.length < 1) {
    return []
  }

  const searchLower = query.toLowerCase().trim()

  // Flexiblere Suche: Prüfe jedes Wort separat
  const searchWords = searchLower.split(/\s+/)

  // Verwende synchronisierte Datenbank falls verfügbar
  let stocksToSearch = LOCAL_STOCKS
  console.log('[StockDatabase] LOCAL_STOCKS count:', LOCAL_STOCKS.length)
  console.log('[StockDatabase] Last 5 entries:', LOCAL_STOCKS.slice(-5).map(s => s.name))

  try {
    const merged = getMergedStockDatabase()
    if (merged && merged.length > 0) {
      console.log('[StockDatabase] Using merged database with', merged.length, 'stocks')
      stocksToSearch = merged
    }
  } catch (error) {
    console.log('[StockDatabase] Using LOCAL_STOCKS only (sync not available)')
  }

  console.log('[StockDatabase] Searching in', stocksToSearch.length, 'stocks for:', query)

  return stocksToSearch.filter((stock) => {
    const nameWords = stock.name.toLowerCase().split(/\s+/)
    const tickerLower = stock.ticker.toLowerCase()
    const isinLower = stock.isin.toLowerCase()

    // Wenn nur ein Suchwort: normale Suche
    if (searchWords.length === 1) {
      return (
        stock.name.toLowerCase().includes(searchLower) ||
        tickerLower.includes(searchLower) ||
        isinLower.includes(searchLower) ||
        tickerLower.startsWith(searchLower) ||
        nameWords.some((word) => word.startsWith(searchLower))
      )
    }

    // Mehrere Suchworte: alle müssen im Namen vorkommen
    return searchWords.every(
      (searchWord) =>
        nameWords.some((nameWord) => nameWord.includes(searchWord)) ||
        tickerLower.includes(searchWord) ||
        isinLower.includes(searchWord)
    )
  }).slice(0, 20) // Max 20 Ergebnisse
}

/**
 * Holt Stock per ISIN aus lokaler DB
 */
export function getLocalStockByISIN(isin: string): StockSearchResult | null {
  return LOCAL_STOCKS.find(stock => stock.isin === isin) || null
}
