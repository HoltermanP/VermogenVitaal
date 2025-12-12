// Test met verschillende periodes om te zien waar 83% vandaan komt

function calculateNetYield(initialInvestment: number, period: number, annualReturn: number, box3TaxPerYear: number, finalTax: number = 0): number {
  let value = initialInvestment
  let totalBox3Tax = 0

  for (let year = 1; year <= period; year++) {
    totalBox3Tax += box3TaxPerYear
    value = value * (1 + annualReturn/100) - box3TaxPerYear
  }

  const finalValue = value - finalTax
  return ((finalValue / initialInvestment) - 1) * 100
}

console.log("Test verschillende periodes:")
console.log("Periode | BV Rendement | EMZ Rendement")
console.log("--------|--------------|--------------")

for (let period = 1; period <= 10; period++) {
  const bvYield = calculateNetYield(101250, period, 7, 2326, 34112 / (period > 5 ? period/5 : 1)) // Schatting
  const emzYield = calculateNetYield(78788, period, 7, 1777, 0)

  console.log(`${period.toString().padStart(7)} | ${bvYield.toFixed(1).padStart(12)}% | ${emzYield.toFixed(1).padStart(12)}%`)
}

// Misschien ziet hij het rendement per jaar?
console.log("\nJaarlijks rendement (vereenvoudigd):")
console.log("BV:", Math.pow(128723/101250, 1/5).toFixed(3))
console.log("EMZ:", Math.pow(100356/78788, 1/5).toFixed(3))
