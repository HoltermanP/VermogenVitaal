// Eenvoudige test van de berekening

const annualIncome = 10000
const expectedReturn = 7
const holdingPeriod = 10
const hasPartner = false

const annualReturnRate = expectedReturn / 100

// PRIVÉ SCENARIO
const calculateIncomeTax = (income: number) => {
  if (income <= 75518) {
    return income * 0.3697
  } else {
    return 75518 * 0.3697 + (income - 75518) * 0.495
  }
}

const privateIncomeTax = calculateIncomeTax(annualIncome)
const privateNetIncome = annualIncome - privateIncomeTax

let privatePortfolioValue = 0
let privateTotalInvested = 0
let privateBox3TaxPaid = 0

for (let year = 1; year <= holdingPeriod; year++) {
  const taxFreeAmount = hasPartner ? 114000 : 57000
  const taxableAmount = Math.max(0, privatePortfolioValue - taxFreeAmount)

  if (taxableAmount > 0) {
    const assumedReturn = taxableAmount * 0.0617
    const yearBox3Tax = assumedReturn * 0.36
    privateBox3TaxPaid += yearBox3Tax
    privatePortfolioValue -= yearBox3Tax
  }

  privatePortfolioValue += privateNetIncome
  privateTotalInvested += privateNetIncome
  privatePortfolioValue *= (1 + annualReturnRate)
}

const privateTotalReturn = privatePortfolioValue - privateTotalInvested
const privateTotalOriginalIncome = annualIncome * holdingPeriod
const privateTotalIncomeTaxPaid = privateIncomeTax * holdingPeriod
const privateTotalTaxPaid = privateTotalIncomeTaxPaid + privateBox3TaxPaid
const privateEffectiveTaxRate = (privateTotalTaxPaid / privateTotalOriginalIncome) * 100

// BV SCENARIO
const calculateCorporateTax = (profit: number) => {
  if (profit <= 200000) {
    return profit * 0.19
  } else {
    return 200000 * 0.19 + (profit - 200000) * 0.258
  }
}

let bvPortfolioValue = 0
let bvTotalInvested = 0
let bvCorpTaxPaid = 0

for (let year = 1; year <= holdingPeriod; year++) {
  const yearCorpTax = calculateCorporateTax(annualIncome)
  const yearNetIncome = annualIncome - yearCorpTax
  bvCorpTaxPaid += yearCorpTax

  bvPortfolioValue += yearNetIncome
  bvTotalInvested += yearNetIncome
  bvPortfolioValue *= (1 + annualReturnRate)
}

const dividendTaxRate = 0.265
const bvDividendPayout = bvPortfolioValue
const bvDividendTaxPaid = bvDividendPayout * dividendTaxRate
const bvFinalValue = bvDividendPayout - bvDividendTaxPaid

const bvTotalReturn = bvFinalValue - bvTotalInvested
const bvTotalTaxPaid = bvCorpTaxPaid + bvDividendTaxPaid
const bvTotalOriginalIncome = annualIncome * holdingPeriod
const bvEffectiveTaxRate = (bvTotalTaxPaid / bvTotalOriginalIncome) * 100

console.log("=== TEST MET €10.000 INKOMEN, 7% RENDEMENT, 10 JAAR ===\n")

console.log("PRIVÉ SCENARIO:")
console.log("  Eindwaarde portfolio: €" + Math.round(privatePortfolioValue).toLocaleString('nl-NL'))
console.log("  Totaal belegd: €" + Math.round(privateTotalInvested).toLocaleString('nl-NL'))
console.log("  Beleggingsrendement: €" + Math.round(privateTotalReturn).toLocaleString('nl-NL'))
console.log("  Box 3 belasting: €" + Math.round(privateBox3TaxPaid).toLocaleString('nl-NL'))
console.log("  Netto rendement: €" + Math.round(privateTotalReturn).toLocaleString('nl-NL'))
console.log("  Effectief belastingtarief: " + privateEffectiveTaxRate.toFixed(1) + "%")
console.log()

console.log("BV SCENARIO:")
console.log("  Eindwaarde portfolio (voor dividend): €" + Math.round(bvPortfolioValue).toLocaleString('nl-NL'))
console.log("  Totaal belegd: €" + Math.round(bvTotalInvested).toLocaleString('nl-NL'))
console.log("  Vennootschapsbelasting: €" + Math.round(bvCorpTaxPaid).toLocaleString('nl-NL'))
console.log("  Dividendbelasting: €" + Math.round(bvDividendTaxPaid).toLocaleString('nl-NL'))
console.log("  Netto eindresultaat: €" + Math.round(bvFinalValue).toLocaleString('nl-NL'))
console.log("  Netto rendement: €" + Math.round(bvTotalReturn).toLocaleString('nl-NL'))
console.log("  Effectief belastingtarief: " + bvEffectiveTaxRate.toFixed(1) + "%")
console.log()

console.log("VERGELIJKING:")
console.log("  Verschil: €" + Math.round(bvTotalReturn - privateTotalReturn).toLocaleString('nl-NL'))
console.log("  BV effectief tarief: " + bvEffectiveTaxRate.toFixed(1) + "%")
console.log("  Privé effectief tarief: " + privateEffectiveTaxRate.toFixed(1) + "%")
