export interface FIRECalculatorInput {
  annualExpenses: number
  currentSavings: number
  monthlySavings: number
  expectedReturn: number
  safeWithdrawalRate: number
  currentAge: number
  desiredRetirementAge: number
  inflationRate: number
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
}

export interface FIRECalculatorResult {
  fireNumber: number
  currentProgress: number
  shortfall: number
  timeToFIRE: number
  monthlyRequired: number
  yearsToRetirement: number
  projectedSavings: number
  safeWithdrawalAmount: number
  coastFIRE: number
  leanFIRE: number
  fatFIRE: number
  feasibility: 'excellent' | 'good' | 'challenging' | 'unlikely'
  advice: string[]
}

export function calculateFIRE(input: FIRECalculatorInput): FIRECalculatorResult {
  const {
    annualExpenses,
    currentSavings = 0,
    monthlySavings = 0,
    expectedReturn = 7,
    safeWithdrawalRate = 4,
    currentAge,
    desiredRetirementAge,
    inflationRate = 2,
    riskProfile = 'moderate'
  } = input

  // FIRE nummer berekening (25x jaarlijkse uitgaven bij 4% opname)
  const fireNumber = annualExpenses * (100 / safeWithdrawalRate)

  // Coast FIRE (begin met sparen, stop bij bepaalde leeftijd)
  const coastFIRE = fireNumber * 0.8 // Vereenvoudigd

  // Lean FIRE (lage kosten levensstijl)
  const leanFIRE = annualExpenses * 0.7 * (100 / safeWithdrawalRate)

  // Fat FIRE (hoge kosten levensstijl)
  const fatFIRE = annualExpenses * 1.5 * (100 / safeWithdrawalRate)

  // Huidige voortgang
  const currentProgress = (currentSavings / fireNumber) * 100

  // Jaarlijkse uitgaven gecorrigeerd voor inflatie
  const yearsToRetirement = desiredRetirementAge - currentAge
  const inflationAdjustedExpenses = annualExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement)

  // FIRE nummer aangepast voor inflatie
  const adjustedFireNumber = inflationAdjustedExpenses * (100 / safeWithdrawalRate)

  // Projectie van spaargroei
  const monthlyReturn = expectedReturn / 100 / 12
  let projectedSavings = currentSavings

  // Toekomstwaarde huidige spaargelden
  projectedSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement)

  // Toekomstwaarde maandelijkse bijdragen
  if (monthlySavings > 0 && yearsToRetirement > 0) {
    const months = yearsToRetirement * 12
    const futureValueMonthly = monthlySavings * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn)
    projectedSavings += futureValueMonthly
  }

  // Shortfall
  const shortfall = Math.max(0, adjustedFireNumber - projectedSavings)

  // Tijd tot FIRE met huidige spaargroep
  let timeToFIRE = yearsToRetirement
  if (projectedSavings >= adjustedFireNumber) {
    // Bereken wanneer FIRE bereikt wordt
    let balance = currentSavings
    let monthsNeeded = 0
    const target = adjustedFireNumber

    while (balance < target && monthsNeeded < yearsToRetirement * 12) {
      balance += monthlySavings
      balance *= (1 + monthlyReturn)
      monthsNeeded++
    }

    timeToFIRE = monthsNeeded / 12
  }

  // Maandelijks benodigd om FIRE te bereiken
  const months = yearsToRetirement * 12
  const targetWithoutCurrent = adjustedFireNumber - currentSavings
  const monthlyRequired = targetWithoutCurrent > 0 ?
    (targetWithoutCurrent * monthlyReturn * Math.pow(1 + monthlyReturn, months)) /
    (Math.pow(1 + monthlyReturn, months) - 1) : 0

  // Safe withdrawal bedrag
  const safeWithdrawalAmount = adjustedFireNumber * (safeWithdrawalRate / 100)

  // Feasibility assessment
  let feasibility: 'excellent' | 'good' | 'challenging' | 'unlikely'

  if (currentProgress >= 80) {
    feasibility = 'excellent'
  } else if (currentProgress >= 50) {
    feasibility = 'good'
  } else if (currentProgress >= 25) {
    feasibility = 'challenging'
  } else {
    feasibility = 'unlikely'
  }

  // Advies genereren
  const advice: string[] = []

  if (currentProgress >= 100) {
    advice.push("Gefeliciteerd! Je hebt je FIRE doel al bereikt!")
  } else {
    advice.push(`${currentProgress.toFixed(1)}% van FIRE doel bereikt`)
  }

  if (riskProfile === 'conservative' && safeWithdrawalRate > 3.5) {
    advice.push("Conservatief profiel - overweeg lagere opnameratio")
  } else if (riskProfile === 'aggressive' && safeWithdrawalRate < 4.5) {
    advice.push("Offensief profiel - hogere opnameratio mogelijk")
  }

  if (yearsToRetirement < 10) {
    advice.push("Beperkte tijd - forse inspanningen nodig voor FIRE")
  }

  if (expectedReturn < 6) {
    advice.push("Laag verwacht rendement - FIRE doel wordt uitdagender")
  }

  if (annualExpenses > 50000) {
    advice.push("Hoge jaarlijkse uitgaven - overweeg Lean FIRE alternatief")
  }

  if (shortfall > 0) {
    advice.push(`Verhoog maandelijkse bijdrage met €${Math.round(shortfall / yearsToRetirement / 12).toLocaleString('nl-NL')}`)
  }

  if (timeToFIRE < yearsToRetirement) {
    advice.push(`FIRE haalbaar in ${timeToFIRE.toFixed(1)} jaar - sneller dan gepland!`)
  }

  return {
    fireNumber: Math.round(fireNumber),
    currentProgress: Math.round(currentProgress * 10) / 10,
    shortfall: Math.round(shortfall),
    timeToFIRE: Math.round(timeToFIRE * 10) / 10,
    monthlyRequired: Math.round(monthlyRequired),
    yearsToRetirement,
    projectedSavings: Math.round(projectedSavings),
    safeWithdrawalAmount: Math.round(safeWithdrawalAmount),
    coastFIRE: Math.round(coastFIRE),
    leanFIRE: Math.round(leanFIRE),
    fatFIRE: Math.round(fatFIRE),
    feasibility,
    advice
  }
}