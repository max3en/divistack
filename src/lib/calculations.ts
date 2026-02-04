import { Position, DividendPayment, WITHHOLDING_TAX_RATES, CAPITAL_GAINS_TAX_RATE, DashboardStats } from './types'
import { addMonths, addYears, startOfYear, endOfYear, isWithinInterval } from 'date-fns'

/**
 * Berechnet Netto-Dividende nach Quellen- und Kapitalertragsteuer
 */
export function calculateNetDividend(
  grossDividend: number,
  country: string,
  freeAllowanceRemaining: number
): {
  gross: number
  withholdingTax: number
  capitalGainsTax: number
  net: number
} {
  // 1. Quellensteuer
  const withholdingRate = WITHHOLDING_TAX_RATES[country] ?? 0
  const withholdingTax = grossDividend * withholdingRate

  // 2. Steuerpflichtiger Betrag (vor FSA)
  let taxableAmount = grossDividend

  // 3. Freistellungsauftrag
  if (freeAllowanceRemaining > 0) {
    const exempt = Math.min(taxableAmount, freeAllowanceRemaining)
    taxableAmount -= exempt
  }

  // 4. Kapitalertragsteuer
  const capitalGainsTax = taxableAmount * CAPITAL_GAINS_TAX_RATE

  // 5. Quellensteuer anrechnen
  const creditableTax = Math.min(withholdingTax, capitalGainsTax)
  const finalCapitalGainsTax = Math.max(0, capitalGainsTax - creditableTax)

  // 6. Netto
  const net = grossDividend - withholdingTax - finalCapitalGainsTax

  return {
    gross: grossDividend,
    withholdingTax,
    capitalGainsTax: finalCapitalGainsTax,
    net,
  }
}

/**
 * Berechnet alle Dividendenzahlungen für eine Position im angegebenen Zeitraum
 */
export function calculateDividendPayments(
  position: Position,
  startDate: Date,
  endDate: Date,
  freeAllowanceRemaining: number
): DividendPayment[] {
  const payments: DividendPayment[] = []
  let remainingAllowance = freeAllowanceRemaining

  // Umrechnung in EUR wenn nötig
  const dividendInEUR = position.currency === 'EUR'
    ? position.dividendPerShare
    : position.dividendPerShare / position.exchangeRate

  const grossPerPayment = dividendInEUR * position.quantity

  // Verwende alle paymentDates statt automatisch generierter Termine
  position.paymentDates.forEach(dateStr => {
    const paymentDate = new Date(dateStr)

    if (paymentDate >= startDate && paymentDate <= endDate) {
      const taxResult = calculateNetDividend(grossPerPayment, position.country, remainingAllowance)

      payments.push({
        positionId: position.id,
        positionName: position.name,
        date: paymentDate.toISOString(),
        grossAmount: taxResult.gross,
        withholdingTax: taxResult.withholdingTax,
        capitalGainsTax: taxResult.capitalGainsTax,
        netAmount: taxResult.net,
      })

      // FSA verbrauchen
      const usedAllowance = Math.min(remainingAllowance, grossPerPayment)
      remainingAllowance = Math.max(0, remainingAllowance - usedAllowance)
    }
  })

  return payments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Berechnet nächsten Zahlungstermin basierend auf Intervall
 */
function getNextPaymentDate(currentDate: Date, interval: Position['paymentInterval']): Date {
  switch (interval) {
    case 'monthly':
      return addMonths(currentDate, 1)
    case 'quarterly':
      return addMonths(currentDate, 3)
    case 'semi-annual':
      return addMonths(currentDate, 6)
    case 'annual':
      return addYears(currentDate, 1)
  }
}

/**
 * Berechnet Dashboard-Statistiken für alle Positionen
 */
export function calculateDashboardStats(
  positions: Position[],
  freeAllowance: number
): DashboardStats {
  const now = new Date()
  const yearStart = startOfYear(now)
  const yearEnd = endOfYear(now)

  let totalGrossAnnual = 0
  let totalNetAnnual = 0
  let totalWithholdingTax = 0
  let totalCapitalGainsTax = 0
  let remainingAllowance = freeAllowance

  positions.forEach(position => {
    const payments = calculateDividendPayments(position, yearStart, yearEnd, remainingAllowance)

    payments.forEach(payment => {
      totalGrossAnnual += payment.grossAmount
      totalNetAnnual += payment.netAmount
      totalWithholdingTax += payment.withholdingTax
      totalCapitalGainsTax += payment.capitalGainsTax

      // FSA verbrauchen
      const used = Math.min(remainingAllowance, payment.grossAmount)
      remainingAllowance = Math.max(0, remainingAllowance - used)
    })
  })

  return {
    totalGrossAnnual,
    totalNetAnnual,
    totalWithholdingTax,
    totalCapitalGainsTax,
    averageMonthlyNet: totalNetAnnual / 12,
    freeAllowanceRemaining: remainingAllowance,
  }
}

/**
 * Gruppiert Dividendenzahlungen nach Monat für Chart
 */
export function groupPaymentsByMonth(payments: DividendPayment[]): Array<{ month: string; gross: number; net: number }> {
  const monthMap = new Map<string, { gross: number; net: number }>()

  payments.forEach(payment => {
    const month = new Date(payment.date).toISOString().substring(0, 7) // YYYY-MM
    const existing = monthMap.get(month) || { gross: 0, net: 0 }
    monthMap.set(month, {
      gross: existing.gross + payment.grossAmount,
      net: existing.net + payment.netAmount,
    })
  })

  return Array.from(monthMap.entries())
    .map(([month, values]) => ({ month, ...values }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Berechnet Portfolio-Performance (Gewinn/Verlust)
 */
export function calculatePortfolioPerformance(positions: Position[]) {
  let totalCost = 0
  let totalValue = 0

  positions.forEach(p => {
    const currentPrice = p.currentPrice ?? p.purchasePrice
    totalCost += p.quantity * p.purchasePrice
    totalValue += p.quantity * currentPrice
  })

  const totalGain = totalValue - totalCost
  const performancePercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  return {
    totalCost,
    totalValue,
    totalGain,
    performancePercent
  }
}
