// Test de gecorrigeerde berekening

import { calculateBvVsPrivateInvestment } from './src/lib/calculators/bv-vs-private-investment'

const result = calculateBvVsPrivateInvestment({
  annualIncome: 10000,
  expectedReturn: 7,
  holdingPeriod: 10,
  hasPartner: false
})

console.log("=== TEST MET €10.000 INKOMEN, 7% RENDEMENT, 10 JAAR ===\n")

console.log("PRIVÉ SCENARIO:")
console.log("  Eindwaarde portfolio:", result.private.finalValue)
console.log("  Totaal belegd:", result.private.finalValue - result.private.totalReturn)
console.log("  Beleggingsrendement:", result.private.totalReturn)
console.log("  Box 3 belasting:", result.private.box3TaxPaid)
console.log("  Netto rendement:", result.private.netReturn)
console.log("  Effectief belastingtarief:", result.private.effectiveTaxRate.toFixed(1) + "%")
console.log()

console.log("BV SCENARIO:")
console.log("  Eindwaarde portfolio:", result.bv.finalValue)
console.log("  Totaal belegd:", result.bv.finalValue - result.bv.totalReturn)
console.log("  Beleggingsrendement:", result.bv.totalReturn)
console.log("  Vennootschapsbelasting:", result.bv.corpTaxPaid)
console.log("  Dividendbelasting:", result.bv.dividendTaxPaid)
console.log("  Netto rendement:", result.bv.netReturn)
console.log("  Effectief belastingtarief:", result.bv.effectiveTaxRate.toFixed(1) + "%")
console.log()

console.log("VERGELIJKING:")
console.log("  Verschil:", result.comparison.difference)
console.log("  Percentage verschil:", result.comparison.percentageDifference.toFixed(1) + "%")
console.log("  Aanbeveling:", result.comparison.recommendation)
