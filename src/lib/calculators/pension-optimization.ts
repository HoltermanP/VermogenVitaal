export interface PensionOptimizationInput {
  currentAge: number
  retirementAge: number
  currentIncome: number
  currentPensionSavings: number
  annualContribution: number
  taxRate: number
  expectedReturn: number
}

export interface PensionOptimizationResult {
  annuityValue: number
  pensionFundValue: number
  taxSavingsAnnuity: number
  taxSavingsPensionFund: number
  netValueAnnuity: number
  netValuePensionFund: number
  recommendation: string
  advice: string[]
}

export function calculatePensionOptimization(input: PensionOptimizationInput): PensionOptimizationResult {
  const {
    currentAge,
    retirementAge,
    currentIncome,
    currentPensionSavings,
    annualContribution,
    taxRate = 0.37,
    expectedReturn = 0.05
  } = input

  const yearsToRetirement = retirementAge - currentAge

  // Lijfrente berekening
  const annuityTaxSavings = annualContribution * taxRate
  const annuityNetContribution = annualContribution - annuityTaxSavings
  const annuityFutureValue = currentPensionSavings * Math.pow(1 + expectedReturn, yearsToRetirement) +
    annuityNetContribution * (((Math.pow(1 + expectedReturn, yearsToRetirement) - 1) / expectedReturn))

  // Bij uitkering: belasting over uitkering (gemiddeld 20%)
  const annuityNetValue = annuityFutureValue * 0.8

  // Pensioenfonds berekening (geen belasting bij inleg, wel bij uitkering)
  const pensionFundFutureValue = currentPensionSavings * Math.pow(1 + expectedReturn, yearsToRetirement) +
    annualContribution * (((Math.pow(1 + expectedReturn, yearsToRetirement) - 1) / expectedReturn))

  // Bij uitkering: belasting over uitkering (gemiddeld 20%)
  const pensionFundNetValue = pensionFundFutureValue * 0.8

  // Totale belastingbesparing
  const totalTaxSavingsAnnuity = annuityTaxSavings * yearsToRetirement
  const totalTaxSavingsPensionFund = 0 // Geen directe besparing, wel uitgestelde belasting

  let recommendation = "lijfrente"
  if (pensionFundNetValue > annuityNetValue * 1.1) {
    recommendation = "pensioenfonds"
  } else if (Math.abs(pensionFundNetValue - annuityNetValue) < annuityNetValue * 0.05) {
    recommendation = "beide"
  }

  const advice: string[] = []
  if (recommendation === "lijfrente") {
    advice.push("Lijfrente biedt directe belastingbesparing")
    advice.push("Geschikt voor zelfstandigen zonder pensioenfonds")
  } else if (recommendation === "pensioenfonds") {
    advice.push("Pensioenfonds kan voordeliger zijn bij hoge inkomsten")
    advice.push("Geen directe belastingbesparing, wel uitgestelde belasting")
  } else {
    advice.push("Overweeg een mix van beide opties")
  }

  if (yearsToRetirement > 20) {
    advice.push("Lange horizon: compound interest heeft groot effect")
  }

  return {
    annuityValue: annuityFutureValue,
    pensionFundValue: pensionFundFutureValue,
    taxSavingsAnnuity: totalTaxSavingsAnnuity,
    taxSavingsPensionFund: totalTaxSavingsPensionFund,
    netValueAnnuity: annuityNetValue,
    netValuePensionFund: pensionFundNetValue,
    recommendation,
    advice
  }
}


