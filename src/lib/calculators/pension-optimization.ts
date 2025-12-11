export interface PensionOptimizationInput {
  age: number
  annualIncome: number
  taxBracket: '32%' | '37%' | '45%' | '49%'
  investmentAmount: number
  expectedReturn: number
  timeHorizon: number
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
}

export interface PensionOptimizationResult {
  lijfrenteOption: {
    netCost: number
    taxSavings: number
    projectedValue: number
    effectiveReturn: number
  }
  pensionFundOption: {
    netCost: number
    taxSavings: number
    projectedValue: number
    effectiveReturn: number
  }
  recommendedOption: 'lijfrente' | 'pensioenfonds' | 'both'
  difference: number
  advice: string[]
}

export function calculatePensionOptimization(input: PensionOptimizationInput): PensionOptimizationResult {
  const {
    age,
    annualIncome,
    taxBracket,
    investmentAmount,
    expectedReturn = 7,
    timeHorizon,
    riskProfile = 'moderate'
  } = input

  // Belastingtarief omzetten naar nummer
  const taxRate = parseFloat(taxBracket.replace('%', '')) / 100

  // Lijfrente optie
  // Direct fiscaal voordeel bij inleg
  const lijfrenteTaxSavings = investmentAmount * taxRate
  const lijfrenteNetCost = investmentAmount - lijfrenteTaxSavings

  // Uitkering belast met 20% eindheffing (vereenvoudigd)
  const lijfrenteFinalTax = (investmentAmount * Math.pow(1 + expectedReturn / 100, timeHorizon)) * 0.20
  const lijfrenteProjectedValue = investmentAmount * Math.pow(1 + expectedReturn / 100, timeHorizon) - lijfrenteFinalTax

  // Pensioenfonds optie
  // Geen directe belastingvoordeel bij inleg, maar fiscaal voordelig tijdens opbouw
  const pensionFundNetCost = investmentAmount
  const pensionFundTaxSavings = 0 // Pensioenopbouw is fiscaal uitgesteld

  // Bij pensionering: progressieve belasting over uitkering (vereenvoudigd naar 30%)
  const pensionFundFinalTax = (investmentAmount * Math.pow(1 + expectedReturn / 100, timeHorizon)) * 0.30
  const pensionFundProjectedValue = investmentAmount * Math.pow(1 + expectedReturn / 100, timeHorizon) - pensionFundFinalTax

  // Effectieve rendementen
  const lijfrenteEffectiveReturn = (lijfrenteProjectedValue / lijfrenteNetCost - 1) * 100
  const pensionFundEffectiveReturn = (pensionFundProjectedValue / pensionFundNetCost - 1) * 100

  // Aanbeveling bepalen
  let recommendedOption: 'lijfrente' | 'pensioenfonds' | 'both'
  let difference: number

  if (taxRate > 0.40) {
    // Hoge belasting: lijfrente is voordeliger
    recommendedOption = 'lijfrente'
    difference = lijfrenteProjectedValue - pensionFundProjectedValue
  } else if (timeHorizon > 20) {
    // Lange termijn: pensioenfonds heeft voordeel door fiscale uitstel
    recommendedOption = 'pensioenfonds'
    difference = pensionFundProjectedValue - lijfrenteProjectedValue
  } else {
    recommendedOption = 'both'
    difference = Math.abs(lijfrenteProjectedValue - pensionFundProjectedValue)
  }

  // Advies genereren
  const advice: string[] = []

  if (age < 30) {
    advice.push("Begin vroeg met pensioenopbouw voor maximaal fiscaal voordeel")
  }

  if (riskProfile === 'conservative') {
    advice.push("Bij conservatief risicoprofiel is lijfrente vaak stabieler")
  } else if (riskProfile === 'aggressive') {
    advice.push("Bij offensief profiel kan pensioenfonds hogere rendementen opleveren")
  }

  if (taxRate > 0.42) {
    advice.push("Hoge belastingdruk maakt lijfrente extra aantrekkelijk")
  }

  if (timeHorizon < 15) {
    advice.push("Korte termijn: overweeg alternatieven met meer flexibiliteit")
  }

  advice.push(`Lijfrente heeft effectief rendement van ${lijfrenteEffectiveReturn.toFixed(1)}%`)
  advice.push(`Pensioenfonds heeft effectief rendement van ${pensionFundEffectiveReturn.toFixed(1)}%`)

  return {
    lijfrenteOption: {
      netCost: Math.round(lijfrenteNetCost),
      taxSavings: Math.round(lijfrenteTaxSavings),
      projectedValue: Math.round(lijfrenteProjectedValue),
      effectiveReturn: Math.round(lijfrenteEffectiveReturn * 10) / 10
    },
    pensionFundOption: {
      netCost: Math.round(pensionFundNetCost),
      taxSavings: Math.round(pensionFundTaxSavings),
      projectedValue: Math.round(pensionFundProjectedValue),
      effectiveReturn: Math.round(pensionFundEffectiveReturn * 10) / 10
    },
    recommendedOption,
    difference: Math.round(Math.abs(difference)),
    advice
  }
}