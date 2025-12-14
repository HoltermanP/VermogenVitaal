export interface InflationImpactInput {
  currentAmount: number
  years: number
  inflationRate: number
  annualIncrease?: number // Jaarlijkse verhoging van bedrag
}

export interface InflationImpactResult {
  futureValue: number
  purchasingPower: number
  realValue: number
  totalInflation: number
  advice: string[]
}

export function calculateInflationImpact(input: InflationImpactInput): InflationImpactResult {
  const {
    currentAmount,
    years,
    inflationRate = 0.02,
    annualIncrease = 0
  } = input

  // Toekomstige waarde met jaarlijkse verhoging
  let futureValue = currentAmount
  for (let year = 1; year <= years; year++) {
    futureValue = futureValue * (1 + annualIncrease) + (currentAmount * annualIncrease)
  }

  // Koopkracht (gepresenteerde waarde)
  const purchasingPower = currentAmount / Math.pow(1 + inflationRate, years)

  // Reële waarde (toekomstige waarde gecorrigeerd voor inflatie)
  const realValue = futureValue / Math.pow(1 + inflationRate, years)

  // Totale inflatie over periode
  const totalInflation = (Math.pow(1 + inflationRate, years) - 1) * 100

  const advice: string[] = []
  if (purchasingPower < currentAmount * 0.8) {
    advice.push(`Na ${years} jaar heeft €${Math.round(currentAmount).toLocaleString('nl-NL')} de koopkracht van €${Math.round(purchasingPower).toLocaleString('nl-NL')}`)
  }

  if (annualIncrease < inflationRate) {
    advice.push("Je jaarlijkse verhoging is lager dan inflatie - je koopkracht daalt")
  } else if (annualIncrease > inflationRate) {
    advice.push("Je jaarlijkse verhoging compenseert inflatie - je koopkracht stijgt")
  }

  if (years > 20) {
    advice.push("Over lange perioden heeft inflatie een groot effect - investeer om koopkracht te behouden")
  }

  return {
    futureValue,
    purchasingPower,
    realValue,
    totalInflation,
    advice
  }
}



