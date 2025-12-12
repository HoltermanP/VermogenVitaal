// Test script for BV vs EMZ investment scenarios
// Run with: npx ts-node test-investment-scenarios.ts

// Copy the calculation functions from the calculator
const calculateIncomeTax = (income: number) => {
  // Dutch income tax calculation 2025
  if (income <= 75518) {
    return income * 0.3697
  } else {
    return 75518 * 0.3697 + (income - 75518) * 0.495
  }
}

const calculateCorporateTax = (profit: number) => {
  // Dutch corporate tax calculation 2025
  if (profit <= 200000) {
    return profit * 0.19
  } else {
    return 200000 * 0.19 + (profit - 200000) * 0.258
  }
}

const calculateBox3Tax = (assets: number, otherAssets: number = 0) => {
  // Dutch Box 3 tax calculation 2025
  // Heffingsvrije voet: €57.000 per persoon
  // Forfaitair rendement beleggingen: 6,17%
  // Belastingtarief: 36%

  const totalAssets = assets + otherAssets
  const taxableAssets = Math.max(0, totalAssets - 57000)

  // Forfaitair rendement op beleggingen
  const fictitiousReturn = taxableAssets * 0.0617

  // Belasting over fictief rendement
  return fictitiousReturn * 0.36
}

const calculateInvestmentScenarios = (profit: number, bvCorpTax: number, period: number, annualReturn: number, otherAssets: number) => {
  // BV Scenario: Profit stays in BV, invested, then dividend payout
  const bvInitialInvestment = profit - bvCorpTax
  let bvCurrentValue = bvInitialInvestment
  let bvTotalBox3Tax = 0

  // Calculate compound growth and Box 3 tax each year
  for (let year = 1; year <= period; year++) {
    // Box 3 tax on current value
    const box3Tax = calculateBox3Tax(bvCurrentValue, otherAssets)
    bvTotalBox3Tax += box3Tax

    // Growth after tax
    bvCurrentValue = bvCurrentValue * (1 + annualReturn / 100) - box3Tax
  }

  // Dividend payout at end
  const bvDividendPayout = bvCurrentValue
  const bvDividendTax = bvDividendPayout * 0.265
  const bvNetPayout = bvDividendPayout - bvDividendTax
  const bvTotalNetResult = bvNetPayout // This is the final amount available for personal use

  // EMZ Scenario: Profit goes to private, invested, stays private
  const emzInitialInvestment = profit - calculateIncomeTax(profit)
  let emzCurrentValue = emzInitialInvestment
  let emzTotalBox3Tax = 0

  // Calculate compound growth and Box 3 tax each year
  for (let year = 1; year <= period; year++) {
    // Box 3 tax on current value
    const box3Tax = calculateBox3Tax(emzCurrentValue, otherAssets)
    emzTotalBox3Tax += box3Tax

    // Growth after tax
    emzCurrentValue = emzCurrentValue * (1 + annualReturn / 100) - box3Tax
  }

  const emzNetResult = emzCurrentValue // Already private, no additional dividend tax

  const investmentRecommendation = bvTotalNetResult > emzNetResult ? "BV" : "EMZ"
  const investmentDifference = Math.abs(bvTotalNetResult - emzNetResult)

  return {
    bvScenario: {
      initialInvestment: bvInitialInvestment,
      box3Tax: bvTotalBox3Tax,
      finalValue: bvCurrentValue,
      dividendPayout: bvDividendPayout,
      dividendTax: bvDividendTax,
      netPayout: bvNetPayout,
      totalNetResult: bvTotalNetResult
    },
    emzScenario: {
      initialInvestment: emzInitialInvestment,
      box3Tax: emzTotalBox3Tax,
      finalValue: emzCurrentValue,
      netResult: emzNetResult
    },
    recommendation: investmentRecommendation,
    difference: investmentDifference
  }
}

console.log("=== BV vs EMZ Investment Scenarios Test ===\n")

// Test case: €125,000 profit, 5 years, 7% return, €50,000 other assets
const profit = 125000
const bvCorpTax = calculateCorporateTax(profit)
const period = 5
const annualReturn = 7
const otherAssets = 50000

console.log(`Test: €${profit.toLocaleString('nl-NL')} winst, ${period} jaar beleggen, ${annualReturn}% rendement, €${otherAssets.toLocaleString('nl-NL')} overige bezittingen\n`)

const result = calculateInvestmentScenarios(profit, bvCorpTax, period, annualReturn, otherAssets)

console.log("BV Scenario:")
console.log(`  Initiële investering: €${Math.round(result.bvScenario.initialInvestment).toLocaleString('nl-NL')}`)
console.log(`  Totale Box 3 belasting: €${Math.round(result.bvScenario.box3Tax).toLocaleString('nl-NL')}`)
console.log(`  Eindwaarde: €${Math.round(result.bvScenario.finalValue).toLocaleString('nl-NL')}`)
console.log(`  Dividenduitkering: €${Math.round(result.bvScenario.dividendPayout).toLocaleString('nl-NL')}`)
console.log(`  Dividendbelasting: €${Math.round(result.bvScenario.dividendTax).toLocaleString('nl-NL')}`)
console.log(`  Netto eindresultaat: €${Math.round(result.bvScenario.totalNetResult).toLocaleString('nl-NL')}`)
console.log()

console.log("EMZ Scenario:")
console.log(`  Initiële investering: €${Math.round(result.emzScenario.initialInvestment).toLocaleString('nl-NL')}`)
console.log(`  Totale Box 3 belasting: €${Math.round(result.emzScenario.box3Tax).toLocaleString('nl-NL')}`)
console.log(`  Eindwaarde: €${Math.round(result.emzScenario.finalValue).toLocaleString('nl-NL')}`)
console.log(`  Netto eindresultaat: €${Math.round(result.emzScenario.netResult).toLocaleString('nl-NL')}`)
console.log()

console.log("Aanbeveling:")
console.log(`${result.recommendation} is €${Math.round(result.difference).toLocaleString('nl-NL')} voordeliger over ${period} jaar`)
console.log()

// Test Box 3 calculation
console.log("=== Box 3 Calculation Test ===")
console.log(`Box 3 belasting op €100,000 vermogen (excl. heffingsvrije voet): €${Math.round(calculateBox3Tax(100000, 0)).toLocaleString('nl-NL')}`)
console.log(`Box 3 belasting op €200,000 vermogen (excl. heffingsvrije voet): €${Math.round(calculateBox3Tax(200000, 0)).toLocaleString('nl-NL')}`)
console.log(`Box 3 belasting op €50,000 vermogen (onder heffingsvrije voet): €${Math.round(calculateBox3Tax(50000, 0)).toLocaleString('nl-NL')}`)
