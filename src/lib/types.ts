export type PaymentInterval = 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
export type Currency = 'EUR' | 'USD' | 'CHF' | 'GBP' | 'NOK' | 'CAD' | 'HKD' | 'JPY'
export type Sector = 'tech' | 'finance' | 'health' | 'consumer' | 'energy' | 'industry' | 'realestate' | 'utilities' | 'materials' | 'telecom' | 'other'

export interface Position {
  id: string
  name: string
  isin: string
  ticker?: string // Optional: Ticker-Symbol (z.B. AAPL, MSFT)
  quantity: number
  purchasePrice: number
  purchaseDate: string
  country: string
  sector: Sector
  dividendPerShare: number
  currency: Currency
  exchangeRate: number // EUR/USD z.B. 1.10 (nur bei currency !== EUR)
  paymentInterval: PaymentInterval
  paymentDates: string[] // Mehrere Zahlungstermine möglich
  exDividendDates?: string[] // Ex-Dividend Dates (optional, selbe Länge wie paymentDates)
  currentPrice?: number // Aktueller Kurs (wird automatisch aktualisiert)
  lastPriceUpdate?: string // ISO-Datum der letzten Kurs-Aktualisierung
}

export const SECTOR_LABELS: Record<Sector, string> = {
  tech: 'Technologie',
  finance: 'Finanzen',
  health: 'Gesundheit',
  consumer: 'Konsum',
  energy: 'Energie',
  industry: 'Industrie',
  realestate: 'Immobilien',
  utilities: 'Versorger',
  materials: 'Rohstoffe',
  telecom: 'Telekommunikation',
  other: 'Sonstiges',
}

export interface TaxConfig {
  freeAllowance: number // Freistellungsauftrag (1000 oder 2000)
  freeAllowanceUsed: number // Bereits verbrauchter Betrag
}

export interface DividendPayment {
  positionId: string
  positionName: string
  date: string
  grossAmount: number // In EUR
  withholdingTax: number
  capitalGainsTax: number
  netAmount: number
}

export interface DashboardStats {
  totalGrossAnnual: number
  totalNetAnnual: number
  totalWithholdingTax: number
  totalCapitalGainsTax: number
  averageMonthlyNet: number
  freeAllowanceRemaining: number
}

// Quellensteuer-Sätze nach Land
export const WITHHOLDING_TAX_RATES: Record<string, number> = {
  DE: 0,      // Deutschland
  US: 0.15,   // USA (mit DBA)
  CH: 0.35,   // Schweiz
  GB: 0,      // Großbritannien
  FR: 0.12,   // Frankreich
  NL: 0.15,   // Niederlande
  AT: 0.275,  // Österreich
  IE: 0,      // Irland
}

// Kapitalertragsteuer Deutschland: 25% + 5.5% Soli
export const CAPITAL_GAINS_TAX_RATE = 0.26375
