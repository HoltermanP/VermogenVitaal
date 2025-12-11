export interface ChildrenSavingsInput {
  childAge: number
  targetAge: number
  targetAmount: number
  currentSavings: number
  monthlyContribution: number
  expectedReturn: number
  purpose: 'study' | 'starter' | 'general'
  inflationRate: number
  taxFree: boolean
}

export interface ChildrenSavingsResult {
  requiredMonthly: number
  projectedAmount: number
  totalContributions: number
  totalGrowth: number
  shortfall: number
  yearsUntilGoal: number
  inflationAdjustedTarget: number
  effectiveReturn: number
  taxSavings: number
  alternatives: string[]
  advice: string[]
}

export function calculateChildrenSavings(input: ChildrenSavingsInput): ChildrenSavingsResult {
  const {
    childAge,
    targetAge,
    targetAmount,
    currentSavings = 0,
    monthlyContribution = 0,
    expectedReturn = 6,
    purpose = 'general',
    inflationRate = 2,
    taxFree = false
  } = input

  const yearsUntilGoal = targetAge - childAge

  if (yearsUntilGoal <= 0) {
    return {
      requiredMonthly: 0,
      projectedAmount: currentSavings,
      totalContributions: currentSavings,
      totalGrowth: 0,
      shortfall: 0,
      yearsUntilGoal: 0,
      inflationAdjustedTarget: targetAmount,
      effectiveReturn: 0,
      taxSavings: 0,
      alternatives: [],
      advice: ["Doel is al bereikt!"]
    }
  }

  // Standaard doelbedragen gebaseerd op doel
  let adjustedTarget = targetAmount
  if (targetAmount === 0) {
    if (purpose === 'study') {
      adjustedTarget = 50000 // Gemiddelde studie kosten
    } else if (purpose === 'starter') {
      adjustedTarget = 30000 // Starterskapitaal
    } else {
      adjustedTarget = 20000 // Algemeen doel
    }
  }

  // Inflatiecorrectie
  const inflationMultiplier = Math.pow(1 + inflationRate / 100, yearsUntilGoal)
  const inflationAdjustedTarget = adjustedTarget * inflationMultiplier

  // Benodigd maandelijks bedrag berekening
  const monthlyReturn = expectedReturn / 100 / 12
  const months = yearsUntilGoal * 12
  const targetWithoutCurrent = inflationAdjustedTarget - currentSavings

  // PMT formula
  const requiredMonthly = targetWithoutCurrent > 0 ?
    (targetWithoutCurrent * monthlyReturn * Math.pow(1 + monthlyReturn, months)) /
    (Math.pow(1 + monthlyReturn, months) - 1) : 0

  // Projectie met huidige maandelijkse bijdrage
  let projectedAmount = currentSavings
  let totalContributions = currentSavings

  for (let month = 1; month <= months; month++) {
    projectedAmount += monthlyContribution
    projectedAmount *= (1 + monthlyReturn)
    totalContributions += monthlyContribution
  }

  const totalGrowth = projectedAmount - totalContributions
  const shortfall = Math.max(0, inflationAdjustedTarget - projectedAmount)

  // Effectief rendement na inflatie
  const realReturn = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1
  const effectiveReturn = realReturn * 100

  // Belastingvoordeel (vereenvoudigd)
  const taxSavings = taxFree ? totalGrowth * 0.25 : 0 // Gemiddeld belastingvoordeel

  // Alternatieven
  const alternatives: string[] = []
  if (purpose === 'study') {
    alternatives.push("Leenstelsel - overheid leent tegen lage rente")
    alternatives.push("Groen licht tegoed van DUO")
    alternatives.push("Bijbaan tijdens studie")
  } else if (purpose === 'starter') {
    alternatives.push("Starterslening via gemeente")
    alternatives.push("Huurwoning met kooprecht")
    alternatives.push("Familiehypotheek")
  }
  alternatives.push("Spaarloonregeling werkgever")
  alternatives.push("Schenking met belastingvoordeel")

  // Advies genereren
  const advice: string[] = []

  if (yearsUntilGoal > 18) {
    advice.push("Veel tijd - focus op consistente maandelijkse bijdragen")
  } else if (yearsUntilGoal < 5) {
    advice.push("Beperkte tijd - forse maandelijkse bijdragen nodig")
  }

  if (monthlyContribution === 0 && requiredMonthly > 0) {
    advice.push(`Begin met €${Math.round(requiredMonthly).toLocaleString('nl-NL')}/maand voor realistisch doel`)
  }

  if (purpose === 'study') {
    advice.push("Check DUO Groen Licht tegoed voor extra voordeel")
  }

  if (taxFree) {
    advice.push("Spaarrekening voor kind heeft belastingvoordeel")
  }

  if (expectedReturn > 7) {
    advice.push("Rendementsverwachting ambitieus - spreid over verschillende beleggingen")
  }

  if (inflationRate > 3) {
    advice.push("Hoge inflatie verhoogt doelbedrag aanzienlijk")
  }

  if (shortfall > 0) {
    advice.push(`Verhoog maandelijkse bijdrage met €${Math.round(shortfall / yearsUntilGoal / 12).toLocaleString('nl-NL')}`)
  }

  return {
    requiredMonthly: Math.round(requiredMonthly),
    projectedAmount: Math.round(projectedAmount),
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(totalGrowth),
    shortfall: Math.round(shortfall),
    yearsUntilGoal,
    inflationAdjustedTarget: Math.round(inflationAdjustedTarget),
    effectiveReturn: Math.round(effectiveReturn * 10) / 10,
    taxSavings: Math.round(taxSavings),
    alternatives,
    advice
  }
}