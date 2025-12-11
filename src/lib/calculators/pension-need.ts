export interface PensionNeedInput {
  currentAge: number
  retirementAge: number
  currentIncome: number
  desiredReplacementRate: number // Percentage van huidig inkomen (bijv. 0.7 = 70%)
  lifeExpectancy: number
  inflationRate: number
  expectedReturn: number
}

export interface PensionNeedResult {
  annualPensionNeed: number
  totalPensionNeed: number
  monthlyPensionNeed: number
  requiredSavings: number
  monthlySavingsNeeded: number
  advice: string[]
}

export function calculatePensionNeed(input: PensionNeedInput): PensionNeedResult {
  const {
    currentAge,
    retirementAge,
    currentIncome,
    desiredReplacementRate = 0.7,
    lifeExpectancy,
    inflationRate = 0.02,
    expectedReturn = 0.05
  } = input

  const yearsToRetirement = retirementAge - currentAge
  const yearsInRetirement = lifeExpectancy - retirementAge

  // Huidig inkomen geïndexeerd naar pensioenleeftijd
  const futureIncome = currentIncome * Math.pow(1 + inflationRate, yearsToRetirement)
  
  // Jaarlijks pensioenbehoefte bij start pensioen
  const annualPensionNeed = futureIncome * desiredReplacementRate
  const monthlyPensionNeed = annualPensionNeed / 12

  // Totale pensioenbehoefte (som van alle jaarlijkse uitkeringen, rekening houdend met inflatie tijdens pensioen)
  // Als pensioenuitkeringen jaarlijks stijgen met inflatie:
  let totalPensionNeed = 0
  for (let year = 0; year < yearsInRetirement; year++) {
    totalPensionNeed += annualPensionNeed * Math.pow(1 + inflationRate, year)
  }

  // Benodigd vermogen bij pensioen (annuïteit berekening met inflatie-aanpassing)
  // Gebruik de reële rente (nominaal rendement - inflatie) voor de annuïteit
  const realReturn = (expectedReturn - inflationRate) / (1 + inflationRate)
  let requiredSavings = 0
  
  if (Math.abs(realReturn) < 0.0001) {
    // Als reële rente bijna 0 is, gebruik eenvoudige som
    requiredSavings = totalPensionNeed
  } else {
    // Present value van een groeiende annuïteit
    // PV = PMT * (1 - ((1+g)/(1+r))^n) / (r - g)
    // Waar g = inflatie, r = rendement, n = jaren
    const growthFactor = (1 + inflationRate) / (1 + expectedReturn)
    requiredSavings = annualPensionNeed * (1 - Math.pow(growthFactor, yearsInRetirement)) / (expectedReturn - inflationRate)
  }

  // Maandelijkse inleg nodig om benodigd vermogen te bereiken
  // PMT = FV * (r/n) / ((1 + r/n)^(n*t) - 1)
  const monthlyRate = expectedReturn / 12
  const totalMonths = yearsToRetirement * 12
  const futureValueFactor = Math.pow(1 + monthlyRate, totalMonths) - 1
  
  let monthlySavingsNeeded = 0
  if (futureValueFactor > 0) {
    monthlySavingsNeeded = requiredSavings * monthlyRate / futureValueFactor
  } else {
    monthlySavingsNeeded = requiredSavings / totalMonths
  }

  const advice: string[] = []
  if (yearsToRetirement < 10) {
    advice.push("Je hebt weinig tijd tot pensioen, overweeg extra inleg")
  } else if (yearsToRetirement > 30) {
    advice.push("Je hebt veel tijd, gebruik compound interest effect")
  }

  if (desiredReplacementRate > 0.8) {
    advice.push("Hoge vervangingsratio vereist substantiële pensioenopbouw")
  }

  if (monthlySavingsNeeded > currentIncome * 0.2) {
    advice.push("Overweeg je pensioendoelstellingen te herzien of later met pensioen te gaan")
  }

  return {
    annualPensionNeed,
    totalPensionNeed,
    monthlyPensionNeed,
    requiredSavings,
    monthlySavingsNeeded,
    advice
  }
}
