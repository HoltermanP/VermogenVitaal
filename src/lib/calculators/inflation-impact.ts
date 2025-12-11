export interface InflationImpactInput {
  currentAmount: number
  timeHorizon: number
  expectedInflation: number
  investmentReturn: number
  purpose: 'savings' | 'pension' | 'investment' | 'general'
  adjustmentStrategy: 'none' | 'partial' | 'full'
}

export interface InflationImpactResult {
  futureValue: number
  purchasingPower: number
  realReturn: number
  inflationErosion: number
  requiredAdjustment: number
  yearlyBreakdown: Array<{
    year: number
    nominalValue: number
    realValue: number
    inflationFactor: number
  }>
  breakEvenReturn: number
  advice: string[]
}

export function calculateInflationImpact(input: InflationImpactInput): InflationImpactResult {
  const {
    currentAmount,
    timeHorizon,
    expectedInflation = 2,
    investmentReturn = 5,
    purpose = 'general',
    adjustmentStrategy = 'none'
  } = input

  // Inflatie factor
  const inflationFactor = Math.pow(1 + expectedInflation / 100, timeHorizon)

  // Toekomstwaarde nominaal (met investeringsrendement)
  const nominalFutureValue = currentAmount * Math.pow(1 + investmentReturn / 100, timeHorizon)

  // Koopkracht (gecorrigeerd voor inflatie)
  const purchasingPower = nominalFutureValue / inflationFactor

  // Effectief rendement na inflatie
  const realReturn = ((1 + investmentReturn / 100) / (1 + expectedInflation / 100) - 1) * 100

  // Inflatie erosie percentage
  const inflationErosion = ((inflationFactor - 1) * 100)

  // Break-even rendement (rendement nodig om inflatie bij te houden)
  const breakEvenReturn = expectedInflation

  // Benodigde aanpassing gebaseerd op strategie
  let requiredAdjustment = 0
  if (adjustmentStrategy === 'partial') {
    requiredAdjustment = currentAmount * (inflationFactor - 1) * 0.5 // 50% compensatie
  } else if (adjustmentStrategy === 'full') {
    requiredAdjustment = currentAmount * (inflationFactor - 1) // Volledige compensatie
  }

  // Jaarlijkse breakdown
  const yearlyBreakdown = []
  let nominalValue = currentAmount
  let realValue = currentAmount

  for (let year = 0; year <= timeHorizon; year++) {
    yearlyBreakdown.push({
      year,
      nominalValue: Math.round(nominalValue),
      realValue: Math.round(realValue),
      inflationFactor: Math.round(inflationFactor * 100) / 100
    })

    if (year < timeHorizon) {
      nominalValue *= (1 + investmentReturn / 100)
      realValue = nominalValue / Math.pow(1 + expectedInflation / 100, year + 1)
    }
  }

  // Advies genereren
  const advice: string[] = []

  if (realReturn < 0) {
    advice.push("NEGATIEF effectief rendement - geld verliest koopkracht!")
  } else if (realReturn < 2) {
    advice.push("Laag effectief rendement - nauwelijks bescherming tegen inflatie")
  } else if (realReturn > 4) {
    advice.push("Goed effectief rendement - koopkracht blijft behouden")
  }

  if (expectedInflation > 3) {
    advice.push("Hoge inflatie - overweeg inflatie-gekoppelde investeringen")
  }

  if (purpose === 'savings') {
    advice.push("Spaargeld: Overweeg deposito's of obligaties met hogere rente")
  } else if (purpose === 'pension') {
    advice.push("Pensioen: Zorg voor indexatie in pensioenregeling")
  } else if (purpose === 'investment') {
    advice.push("Beleggingen: Spreid over inflatiebestendige assets")
  }

  if (timeHorizon > 20) {
    advice.push("Lange termijn - inflatie erodeert aanzienlijk")
  }

  if (adjustmentStrategy === 'none' && inflationErosion > 50) {
    advice.push("Grote erosie - overweeg aanpassingsstrategie")
  }

  if (investmentReturn < expectedInflation) {
    advice.push(`Rendement (${investmentReturn}%) lager dan inflatie (${expectedInflation}%)`)
  }

  const purchasingPowerLoss = currentAmount - purchasingPower
  if (purchasingPowerLoss > currentAmount * 0.3) {
    advice.push(`Koopkracht verlies: €${Math.round(purchasingPowerLoss).toLocaleString('nl-NL')}`)
  }

  return {
    futureValue: Math.round(nominalFutureValue),
    purchasingPower: Math.round(purchasingPower),
    realReturn: Math.round(realReturn * 10) / 10,
    inflationErosion: Math.round(inflationErosion),
    requiredAdjustment: Math.round(requiredAdjustment),
    yearlyBreakdown,
    breakEvenReturn: Math.round(breakEvenReturn * 10) / 10,
    advice
  }
}