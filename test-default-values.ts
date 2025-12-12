// Test met default waarden uit de calculator

const formData = {
  revenue: 150000,
  costs: 25000,
  legalForm: "zzp",
  salary: 50000,
  dividend: 30000,
  investmentPeriod: 5,
  annualReturn: 7,
  otherAssets: 50000
}

const profit = formData.revenue - formData.costs // 125.000

// BV calculation
const bvCorpTax = 23750 // 19% van 125.000
const bvAfterTax = profit - bvCorpTax // 101.250
const salaryTax = 50000 * 0.3697 // Ongeveer 18.485
const dividendTax = 30000 * 0.265 // 7.950
const bvNetResult = (50000 - 18485) + (30000 - 7950) // 31.515 + 22.050 = 53.565

console.log("=== DIRECTE VERGELIJKING ===")
console.log("EMZ Netto:", Math.round(125000 - (125000 * 0.3697))) // 78.625
console.log("BV Netto:", Math.round(bvNetResult)) // 53.565

// Investment scenario
const bvInitialInvestment = bvAfterTax // 101.250
let bvValue = bvInitialInvestment
let bvBox3Tax = 0

for (let year = 1; year <= formData.investmentPeriod; year++) {
  const box3Tax = Math.max(0, (bvValue + formData.otherAssets - 57000)) * 0.0617 * 0.36
  bvBox3Tax += box3Tax
  bvValue = bvValue * 1.07 - box3Tax
}

const bvDividendPayout = bvValue
const bvDividendTaxAmount = bvDividendPayout * 0.265
const bvNetPayout = bvDividendPayout - bvDividendTaxAmount

console.log("\n=== BELEGGINGSSCENARIO ===")
console.log("BV Initiële investering:", bvInitialInvestment)
console.log("BV Eindwaarde na 5 jaar:", Math.round(bvValue))
console.log("BV Box 3 belasting totaal:", Math.round(bvBox3Tax))
console.log("BV Dividenduitkering:", Math.round(bvDividendPayout))
console.log("BV Dividendbelasting:", Math.round(bvDividendTaxAmount))
console.log("BV Netto eindresultaat:", Math.round(bvNetPayout))

// EMZ scenario
const emzInitialInvestment = profit - (profit * 0.3697) // 78.625
let emzValue = emzInitialInvestment
let emzBox3Tax = 0

for (let year = 1; year <= formData.investmentPeriod; year++) {
  const box3Tax = Math.max(0, (emzValue + formData.otherAssets - 57000)) * 0.0617 * 0.36
  emzBox3Tax += box3Tax
  emzValue = emzValue * 1.07 - box3Tax
}

console.log("\nEMZ Initiële investering:", Math.round(emzInitialInvestment))
console.log("EMZ Eindwaarde na 5 jaar:", Math.round(emzValue))
console.log("EMZ Box 3 belasting totaal:", Math.round(emzBox3Tax))
console.log("EMZ Netto eindresultaat:", Math.round(emzValue))

// Rendementen
const bvTotalReturn = (bvNetPayout / bvInitialInvestment - 1) * 100
const emzTotalReturn = (emzValue / emzInitialInvestment - 1) * 100

console.log("\n=== NETTO RENDEMENTEN ===")
console.log("BV netto rendement:", bvTotalReturn.toFixed(1) + "%")
console.log("EMZ netto rendement:", emzTotalReturn.toFixed(1) + "%")
