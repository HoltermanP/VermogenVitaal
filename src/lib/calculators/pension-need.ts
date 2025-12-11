export interface PensionNeedInput {
  currentIncome: number
  currentExpenses: number
  desiredRetirementAge: number
  lifeExpectancy: number
  expectedInflation: number
  hasPartner: boolean
  partnerIncome?: number
  partnerExpenses?: number
  desiredReplacementRatio: number // Percentage van huidig inkomen dat gewenst is
}

export interface PensionNeedResult {
  requiredAnnualPension: number
  requiredMonthlyPension: number
  aowSupplement: number
  totalRequiredPension: number
  partnerPensionNeeded: number
  projectedExpenses: number
  inflationAdjusted: number
  advice: string[]
}

export function calculatePensionNeed(input: PensionNeedInput): PensionNeedResult {
  const {
    currentIncome,
    currentExpenses,
    desiredRetirementAge,
    lifeExpectancy,
    expectedInflation = 2,
    hasPartner,
    partnerIncome = 0,
    partnerExpenses = 0,
    desiredReplacementRatio = 70
  } = input

  // Bepaal benodigd pensioen gebaseerd op uitgaven en gewenst vervangingspercentage
  const baseRequiredPension = Math.max(currentExpenses, currentIncome * (desiredReplacementRatio / 100))

  // Inflatiecorrectie over de periode tot pensioen
  const yearsToRetirement = Math.max(0, desiredRetirementAge - 25) // Gemiddelde huidige leeftijd assumptie
  const inflationMultiplier = Math.pow(1 + expectedInflation / 100, yearsToRetirement)
  const inflationAdjustedExpenses = baseRequiredPension * inflationMultiplier

  // AOW berekening (vereenvoudigd - gemiddelde AOW is ongeveer €1.400/maand in 2025)
  const averageAOWMonthly = 1400
  const averageAOWAnnual = averageAOWMonthly * 12

  // Partner situatie
  let partnerPensionNeeded = 0
  let totalHouseholdIncome = currentIncome

  if (hasPartner) {
    totalHouseholdIncome += partnerIncome
    const partnerExpenseRatio = partnerExpenses > 0 ? partnerExpenses / (currentExpenses + partnerExpenses) : 0.5
    partnerPensionNeeded = inflationAdjustedExpenses * partnerExpenseRatio - (averageAOWAnnual * 0.6) // Partner krijgt vaak 60% van alleenstaande AOW
  }

  // Totaal benodigd pensioen na AOW
  const aowSupplement = Math.max(0, inflationAdjustedExpenses - averageAOWAnnual)
  const totalRequiredPension = inflationAdjustedExpenses

  // Advies genereren
  const advice: string[] = []

  if (desiredReplacementRatio < 70) {
    advice.push("Een vervangingsratio van minder dan 70% kan leiden tot een lagere levensstandaard")
  }

  if (yearsToRetirement > 20) {
    advice.push("Je hebt nog veel tijd - overweeg consistente pensioenopbouw")
  } else if (yearsToRetirement < 10) {
    advice.push("Beperkte tijd tot pensioen - overweeg extra inspanningen")
  }

  if (hasPartner && partnerIncome < currentIncome * 0.3) {
    advice.push("Partnerinkomen is relatief laag - bouw voldoende partnerpensioen op")
  }

  const replacementRatio = (totalRequiredPension / totalHouseholdIncome) * 100
  if (replacementRatio > 100) {
    advice.push("Je doel is ambitieus - overweeg werken na AOW-leeftijd")
  }

  return {
    requiredAnnualPension: Math.round(totalRequiredPension),
    requiredMonthlyPension: Math.round(totalRequiredPension / 12),
    aowSupplement: Math.round(aowSupplement),
    totalRequiredPension: Math.round(totalRequiredPension),
    partnerPensionNeeded: Math.round(partnerPensionNeeded),
    projectedExpenses: Math.round(inflationAdjustedExpenses),
    inflationAdjusted: Math.round((inflationMultiplier - 1) * 100),
    advice
  }
}