import { EtfGrowthInput } from "@/lib/validations/calculators"

export interface EtfGrowthResult {
  finalValue: number
  totalInvested: number
  totalReturn: number
  returnPercentage: number
  costImpact: number
  scenarios: {
    pessimistic: number
    expected: number
    optimistic: number
  }
  yearlyBreakdown: Array<{
    year: number
    invested: number
    value: number
    return: number
  }>
  advice: string[]
}

export function calculateEtfGrowth(input: EtfGrowthInput): EtfGrowthResult {
  const {
    initialInvestment,
    monthlyContribution,
    expectedReturn,
    pessimisticReturn,
    optimisticReturn,
    ter,
    duration,
    rebalancing,
    box3Rate
  } = input

  // Jaarlijkse berekening
  const yearlyBreakdown: Array<{
    year: number
    invested: number
    value: number
    return: number
  }> = []

  let currentValue = initialInvestment
  let totalInvested = initialInvestment

  for (let year = 1; year <= duration; year++) {
    // Maandelijkse inleg
    const yearlyContribution = monthlyContribution * 12
    totalInvested += yearlyContribution

    // Rendement berekening
    const grossReturn = expectedReturn / 100
    const netReturn = grossReturn - (ter / 100)
    
    // Waarde aan begin van jaar
    const startValue = currentValue
    
    // Nieuwe inleg + rendement
    currentValue = (currentValue + yearlyContribution) * (1 + netReturn)
    
    // Box 3 belasting (vereenvoudigd)
    const box3Tax = currentValue * (box3Rate / 100)
    currentValue -= box3Tax

    yearlyBreakdown.push({
      year,
      invested: totalInvested,
      value: currentValue,
      return: currentValue - totalInvested
    })
  }

  // Scenario berekeningen
  const pessimisticValue = calculateScenarioValue(initialInvestment, monthlyContribution, pessimisticReturn, ter, duration, box3Rate)
  const expectedValue = currentValue
  const optimisticValue = calculateScenarioValue(initialInvestment, monthlyContribution, optimisticReturn, ter, duration, box3Rate)

  const totalReturn = currentValue - totalInvested
  const returnPercentage = (totalReturn / totalInvested) * 100
  const costImpact = totalInvested * (ter / 100) * duration

  // Advies
  const advice: string[] = []
  
  if (ter > 0.5) {
    advice.push("Overweeg goedkopere ETF's om kosten te verlagen")
  }
  
  if (duration < 10) {
    advice.push("Korte beleggingshorizon kan risicovol zijn voor aandelen")
  }
  
  if (monthlyContribution > 0) {
    advice.push("Maandelijkse inleg helpt bij kostenmiddeling")
  }

  if (rebalancing) {
    advice.push("Jaarlijks rebalanceren kan volatiliteit verminderen")
  }

  return {
    finalValue: currentValue,
    totalInvested,
    totalReturn,
    returnPercentage,
    costImpact,
    scenarios: {
      pessimistic: pessimisticValue,
      expected: expectedValue,
      optimistic: optimisticValue
    },
    yearlyBreakdown,
    advice
  }
}

function calculateScenarioValue(
  initial: number,
  monthly: number,
  returnRate: number,
  ter: number,
  duration: number,
  box3Rate: number
): number {
  let value = initial
  const yearlyContribution = monthly * 12
  const netReturn = (returnRate / 100) - (ter / 100)

  for (let year = 1; year <= duration; year++) {
    value = (value + yearlyContribution) * (1 + netReturn)
    const box3Tax = value * (box3Rate / 100)
    value -= box3Tax
  }

  return value
}
