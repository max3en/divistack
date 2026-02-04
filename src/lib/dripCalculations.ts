// DRIP (Dividend Reinvestment Plan) Calculations

export interface DRIPScenario {
  name: string
  initialInvestment: number
  monthlyContribution: number
  years: number
  averageYield: number // in %
  dividendGrowthRate: number // in % per year
  sharePrice: number
  dividendPerShare: number
}

export interface DRIPResult {
  year: number
  totalShares: number
  totalInvested: number
  portfolioValue: number
  annualDividend: number
  dividendPerShare: number
  sharePrice: number
}

export function calculateDRIP(scenario: DRIPScenario): DRIPResult[] {
  const results: DRIPResult[] = []

  let shares = scenario.initialInvestment / scenario.sharePrice
  let totalInvested = scenario.initialInvestment
  let currentDividendPerShare = scenario.dividendPerShare
  let currentSharePrice = scenario.sharePrice

  for (let year = 0; year <= scenario.years; year++) {
    // Berechne jährliche Dividende
    const annualDividend = shares * currentDividendPerShare * 4 // quartalsweise

    // Dividenden reinvestieren
    const reinvestedShares = annualDividend / currentSharePrice
    shares += reinvestedShares

    // Monatliche Beiträge
    const yearlyContribution = scenario.monthlyContribution * 12
    const contributionShares = yearlyContribution / currentSharePrice
    shares += contributionShares
    totalInvested += yearlyContribution

    // Portfolio-Wert
    const portfolioValue = shares * currentSharePrice

    results.push({
      year,
      totalShares: shares,
      totalInvested,
      portfolioValue,
      annualDividend,
      dividendPerShare: currentDividendPerShare,
      sharePrice: currentSharePrice,
    })

    // Wachstum für nächstes Jahr
    currentDividendPerShare *= (1 + scenario.dividendGrowthRate / 100)
    currentSharePrice *= (1 + scenario.averageYield / 100 / 4) // Moderates Kurswachstum
  }

  return results
}

export function compareDRIPScenarios(scenarios: DRIPScenario[]): {
  scenarioName: string
  results: DRIPResult[]
}[] {
  return scenarios.map(scenario => ({
    scenarioName: scenario.name,
    results: calculateDRIP(scenario),
  }))
}

// Sparplan-Kalkulator: "Wie viel monatlich für X€ Dividende/Jahr?"
export interface SavingsPlanGoal {
  targetAnnualDividend: number // Ziel-Dividende pro Jahr
  averageYield: number // Durchschnittliche Dividendenrendite in %
  years: number // Zeitraum
  dividendGrowthRate: number // Dividendenwachstum in %
  initialInvestment: number
}

export interface SavingsPlanResult {
  requiredMonthlyContribution: number
  totalInvested: number
  finalPortfolioValue: number
  finalAnnualDividend: number
  yearlyBreakdown: {
    year: number
    portfolioValue: number
    annualDividend: number
    monthlyContribution: number
  }[]
}

export function calculateSavingsPlan(goal: SavingsPlanGoal): SavingsPlanResult {
  // Binäre Suche für monatlichen Beitrag
  let low = 0
  let high = goal.targetAnnualDividend * 10
  let requiredMonthly = 0

  while (high - low > 0.1) {
    const mid = (low + high) / 2
    const result = simulateSavingsPlan(goal, mid)

    if (result.finalAnnualDividend >= goal.targetAnnualDividend) {
      requiredMonthly = mid
      high = mid
    } else {
      low = mid
    }
  }

  return simulateSavingsPlan(goal, requiredMonthly)
}

function simulateSavingsPlan(goal: SavingsPlanGoal, monthlyContribution: number): SavingsPlanResult {
  let portfolioValue = goal.initialInvestment
  let annualDividend = portfolioValue * (goal.averageYield / 100)
  const yearlyBreakdown: SavingsPlanResult['yearlyBreakdown'] = []

  for (let year = 1; year <= goal.years; year++) {
    // Monatliche Einzahlungen
    const yearlyContribution = monthlyContribution * 12
    portfolioValue += yearlyContribution

    // Dividenden reinvestieren
    portfolioValue += annualDividend

    // Dividendenwachstum
    annualDividend = portfolioValue * (goal.averageYield / 100) * Math.pow(1 + goal.dividendGrowthRate / 100, year)

    yearlyBreakdown.push({
      year,
      portfolioValue,
      annualDividend,
      monthlyContribution,
    })
  }

  const lastYear = yearlyBreakdown[yearlyBreakdown.length - 1]

  return {
    requiredMonthlyContribution: monthlyContribution,
    totalInvested: goal.initialInvestment + (monthlyContribution * 12 * goal.years),
    finalPortfolioValue: lastYear.portfolioValue,
    finalAnnualDividend: lastYear.annualDividend,
    yearlyBreakdown,
  }
}
