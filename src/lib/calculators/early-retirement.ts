export interface EarlyRetirementInput {
  currentAge: number
  desiredRetirementAge: number
  currentSavings: number
  monthlySavings: number
  expectedAnnualReturn: number
  annualExpenses: number
  hasPartner: boolean
  partnerIncome?: number
  inflationRate: number
}

export interface EarlyRetirementResult {
  requiredCapital: number
  projectedSavings: number
  shortfall: number
  additionalMonthlySavings: number
  yearsToRetirement: number
  timeToFIRE: number
  safeWithdrawalRate: number
  fireNumber: number
  leanFIRE: number
  coastFIRE: number
  fatFIRE: number
  feasibility: 'excellent' | 'good' | 'challenging' | 'unlikely'
  advice: string[]
}

export function calculateEarlyRetirement(input: EarlyRetirementInput): EarlyRetirementResult {
  const {
    currentAge,
    desiredRetirementAge,
    currentSavings,
    monthlySavings,
    expectedAnnualReturn = 7,
    annualExpenses,
    hasPartner = false,
    partnerIncome = 0,
    inflationRate = 2
  } = input

  const yearsToRetirement = desiredRetirementAge - currentAge
  const lifeExpectancy = 90 // Gemiddelde levensverwachting
  const retirementYears = lifeExpectancy - desiredRetirementAge

  // Inflatiegecorrigeerde jaarlijkse uitgaven
  const inflationAdjustedExpenses = annualExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement)

  // Safe withdrawal rate (4% regel voor financiële onafhankelijkheid)
  const safeWithdrawalRate = 4 // procent

  // FIRE nummer berekening (25x jaarlijkse uitgaven)
  const fireNumber = inflationAdjustedExpenses * (100 / safeWithdrawalRate)

  // Coast FIRE (begin met sparen, stop bij bepaalde leeftijd)
  const coastFIRE = fireNumber * 0.8 // Vereenvoudigd

  // Lean FIRE (lage kosten levensstijl)
  const leanFIRE = annualExpenses * 0.7 * (100 / safeWithdrawalRate)

  // Fat FIRE (hoge kosten levensstijl)
  const fatFIRE = annualExpenses * 1.5 * (100 / safeWithdrawalRate)

  // Partner inkomen in rekening brengen (indien van toepassing)
  const netExpenses = hasPartner ? Math.max(0, inflationAdjustedExpenses - partnerIncome) : inflationAdjustedExpenses

  // Benodigd kapitaal bij pensionering
  const requiredCapitalAtRetirement = netExpenses * (100 / safeWithdrawalRate)

  // Toekomstwaarde van huidige spaargelden en maandelijkse bijdragen
  const monthlyReturn = expectedAnnualReturn / 100 / 12

  // Toekomstwaarde huidige spaargelden
  const futureValueCurrent = currentSavings * Math.pow(1 + expectedAnnualReturn / 100, yearsToRetirement)

  // Toekomstwaarde maandelijkse bijdragen (annuity formula)
  const futureValueMonthly = monthlySavings * ((Math.pow(1 + monthlyReturn, yearsToRetirement * 12) - 1) / monthlyReturn) * (1 + monthlyReturn)

  const projectedSavings = futureValueCurrent + futureValueMonthly

  // Shortfall berekening
  const shortfall = Math.max(0, requiredCapitalAtRetirement - projectedSavings)
  const additionalMonthlySavings = shortfall > 0 ?
    (shortfall * (expectedAnnualReturn / 100 / 12)) /
    ((Math.pow(1 + expectedAnnualReturn / 100 / 12, yearsToRetirement * 12) - 1) /
     (expectedAnnualReturn / 100 / 12)) : 0

  // Tijd tot FIRE met huidige spaargroep
  let timeToFIRE = yearsToRetirement
  if (projectedSavings >= requiredCapitalAtRetirement) {
    // Bereken wanneer FIRE bereikt wordt
    let balance = currentSavings
    let monthsNeeded = 0
    const target = requiredCapitalAtRetirement

    while (balance < target && monthsNeeded < yearsToRetirement * 12) {
      balance += monthlySavings
      balance *= (1 + monthlyReturn)
      monthsNeeded++
    }

    timeToFIRE = monthsNeeded / 12
  }

  // Feasibility assessment
  let feasibility: 'excellent' | 'good' | 'challenging' | 'unlikely'

  const ratio = projectedSavings / requiredCapitalAtRetirement

  if (ratio >= 1.2) {
    feasibility = 'excellent'
  } else if (ratio >= 0.9) {
    feasibility = 'good'
  } else if (ratio >= 0.7) {
    feasibility = 'challenging'
  } else {
    feasibility = 'unlikely'
  }

  // Advies genereren
  const advice: string[] = []

  if (yearsToRetirement < 10) {
    advice.push("Beperkte tijd tot gewenst pensioen - forse inspanningen nodig")
  } else if (yearsToRetirement > 30) {
    advice.push("Ruim tijd tot pensioen - focus op consistente spaargroei")
  }

  if (expectedAnnualReturn > 8) {
    advice.push("Verwacht rendement lijkt optimistisch - overweeg conservatievere schatting")
  }

  if (safeWithdrawalRate < 3.5) {
    advice.push("Zeer conservatieve opname - hogere opname mogelijk maar risicovoller")
  }

  if (hasPartner && partnerIncome > 0) {
    advice.push(`Partnerinkomen van €${partnerIncome.toLocaleString('nl-NL')}/jaar verlaagt vereiste kapitaal`)
  }

  if (shortfall > 0) {
    advice.push(`Extra €${Math.round(additionalMonthlySavings)}/maand sparen om doel te bereiken`)
  } else {
    advice.push("Je bent op schema voor vroegpensioen!")
  }

  if (inflationRate > 3) {
    advice.push("Hoge inflatie maakt vroegpensioen uitdagender")
  }

  return {
    requiredCapital: Math.round(requiredCapitalAtRetirement),
    projectedSavings: Math.round(projectedSavings),
    shortfall: Math.round(shortfall),
    additionalMonthlySavings: Math.round(additionalMonthlySavings),
    yearsToRetirement,
    timeToFIRE: Math.round(timeToFIRE * 10) / 10,
    safeWithdrawalRate,
    fireNumber: Math.round(fireNumber),
    leanFIRE: Math.round(leanFIRE),
    coastFIRE: Math.round(coastFIRE),
    fatFIRE: Math.round(fatFIRE),
    feasibility,
    advice
  }
}