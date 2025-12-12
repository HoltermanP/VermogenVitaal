// Test script for BV vs EMZ calculator
// Run with: npx ts-node test-bv-calculator.ts

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

const testScenario = (revenue: number, costs: number, salary: number, dividend: number) => {
  const profit = revenue - costs

  // EMZ calculation
  const emzTax = calculateIncomeTax(profit)
  const emzNetResult = profit - emzTax

  // BV calculation
  const bvCorpTax = calculateCorporateTax(profit)
  const bvAfterTax = profit - bvCorpTax
  const salaryTax = calculateIncomeTax(salary)
  const dividendTax = dividend * 0.265
  const bvNetResult = (salary - salaryTax) + (dividend - dividendTax)

  // Validation
  const totalDistributed = salary + dividend
  const validationError = Math.abs(totalDistributed - bvAfterTax) > 1
    ? `Salary + Dividend (${totalDistributed}) != BV After Tax (${bvAfterTax})`
    : null

  const recommendation = bvNetResult > emzNetResult ? "BV" : "EMZ"
  const difference = Math.abs(bvNetResult - emzNetResult)

  return {
    input: { revenue, costs, salary, dividend },
    emz: {
      profit: Math.round(profit),
      tax: Math.round(emzTax),
      netResult: Math.round(emzNetResult)
    },
    bv: {
      profit: Math.round(profit),
      corpTax: Math.round(bvCorpTax),
      afterTax: Math.round(bvAfterTax),
      salaryTax: Math.round(salaryTax),
      dividendTax: Math.round(dividendTax),
      netResult: Math.round(bvNetResult)
    },
    recommendation,
    difference: Math.round(difference),
    validationError
  }
}

console.log("=== BV vs EMZ Calculator Tests ===\n")

// Test 1: Small business
console.log("Test 1: Small business (€125,000 revenue, €25,000 costs, €40,000 salary, €60,000 dividend)")
const test1 = testScenario(125000, 25000, 40000, 60000)
console.log("EMZ Net:", test1.emz.netResult)
console.log("BV Net:", test1.bv.netResult)
console.log("Recommendation:", test1.recommendation, "(€" + test1.difference + " difference)")
console.log("Validation:", test1.validationError || "OK")
console.log()

// Test 2: Large business
console.log("Test 2: Large business (€500,000 revenue, €100,000 costs, €80,000 salary, €320,000 dividend)")
const test2 = testScenario(500000, 100000, 80000, 320000)
console.log("EMZ Net:", test2.emz.netResult)
console.log("BV Net:", test2.bv.netResult)
console.log("Recommendation:", test2.recommendation, "(€" + test2.difference + " difference)")
console.log("Validation:", test2.validationError || "OK")
console.log()

// Test 3: Invalid distribution (salary + dividend != bvAfterTax)
console.log("Test 3: Invalid distribution (€150,000 revenue, €25,000 costs, €50,000 salary, €30,000 dividend)")
const test3 = testScenario(150000, 25000, 50000, 30000)
console.log("EMZ Net:", test3.emz.netResult)
console.log("BV Net:", test3.bv.netResult)
console.log("Recommendation:", test3.recommendation, "(€" + test3.difference + " difference)")
console.log("Validation:", test3.validationError || "OK")
console.log()

// Test 4: Correct distribution
console.log("Test 4: Correct distribution (€150,000 revenue, €25,000 costs, €60,000 salary, €41,250 dividend)")
const test4 = testScenario(150000, 25000, 60000, 41250)
console.log("EMZ Net:", test4.emz.netResult)
console.log("BV Net:", test4.bv.netResult)
console.log("Recommendation:", test4.recommendation, "(€" + test4.difference + " difference)")
console.log("Validation:", test4.validationError || "OK")
console.log()

console.log("=== Tax Calculations Check ===")

// Test income tax calculations
console.log(`Income tax on €50,000: €${Math.round(calculateIncomeTax(50000))}`)
console.log(`Income tax on €100,000: €${Math.round(calculateIncomeTax(100000))}`)

// Test corporate tax calculations
console.log(`Corporate tax on €150,000: €${Math.round(calculateCorporateTax(150000))}`)
console.log(`Corporate tax on €300,000: €${Math.round(calculateCorporateTax(300000))}`)
