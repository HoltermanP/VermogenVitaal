export interface AOWSimulatorInput {
  birthDate: string // Format: YYYY-MM-DD
  workedYears: number
  partnerBirthDate?: string
  hasPartner: boolean
  residenceYears: number // Jaren in Nederland gewoond
}

export interface AOWSimulatorResult {
  aowAge: number
  monthlyAOW: number
  annualAOW: number
  partnerAOW: number
  totalAOW: number
  reductionPercentage: number
  reductionAmount: number
  fullAOWAge: number
  advice: string[]
}

export function calculateAOW(input: AOWSimulatorInput): AOWSimulatorResult {
  const {
    birthDate,
    workedYears,
    partnerBirthDate,
    hasPartner,
    residenceYears
  } = input

  // Parse birth year
  const birthYear = new Date(birthDate).getFullYear()

  // AOW leeftijd berekening gebaseerd op geboortejaar
  let aowAge: number
  let fullAOWAge: number

  if (birthYear >= 1965) {
    aowAge = 67
    fullAOWAge = 67
  } else if (birthYear >= 1961) {
    aowAge = 66.5
    fullAOWAge = 67
  } else if (birthYear >= 1957) {
    aowAge = 66
    fullAOWAge = 67
  } else {
    aowAge = 65
    fullAOWAge = 65
  }

  // Basis AOW bedrag 2025 (gemiddeld)
  const baseAOWMonthly = 1400
  const baseAOWAnnual = baseAOWMonthly * 12

  // Correctie voor gewerkte jaren (minimaal 50 jaar nodig voor volledige AOW)
  const requiredYears = 50
  const workedPercentage = Math.min(workedYears / requiredYears, 1)
  const workedReduction = 1 - workedPercentage

  // Correctie voor woonjaren in Nederland (minimaal 50 jaar)
  const residencePercentage = Math.min(residenceYears / requiredYears, 1)
  const residenceReduction = 1 - residencePercentage

  // Totale korting
  const totalReductionPercentage = Math.max(workedReduction, residenceReduction)
  const reductionAmount = baseAOWAnnual * totalReductionPercentage
  const finalAOWAnnual = baseAOWAnnual * (1 - totalReductionPercentage)
  const finalAOWMonthly = finalAOWAnnual / 12

  // Partner AOW berekening
  let partnerAOW = 0
  if (hasPartner && partnerBirthDate) {
    const partnerBirthYear = new Date(partnerBirthDate).getFullYear()
    let partnerAOWAge: number

    if (partnerBirthYear >= 1965) {
      partnerAOWAge = 67
    } else if (partnerBirthYear >= 1961) {
      partnerAOWAge = 66.5
    } else if (partnerBirthYear >= 1957) {
      partnerAOWAge = 66
    } else {
      partnerAOWAge = 65
    }

    // Partner krijgt meestal 50% van alleenstaande AOW
    partnerAOW = finalAOWAnnual * 0.5
  }

  const totalAOW = finalAOWAnnual + partnerAOW

  // Advies genereren
  const advice: string[] = []

  if (workedYears < requiredYears) {
    advice.push(`${requiredYears - workedYears} jaar gewerkte jaren missen voor volledige AOW`)
  }

  if (residenceYears < requiredYears) {
    advice.push(`${requiredYears - residenceYears} jaar woonjaren missen voor volledige AOW`)
  }

  if (totalReductionPercentage > 0.2) {
    advice.push("Grote korting op AOW - overweeg bijverdienen of emigratie")
  }

  if (birthYear >= 1965) {
    advice.push("AOW-leeftijd is 67 jaar voor jouw geboortejaar")
  }

  if (hasPartner) {
    advice.push("Partner heeft recht op toeslag van ongeveer 50% van jouw AOW")
  }

  return {
    aowAge,
    monthlyAOW: Math.round(finalAOWMonthly),
    annualAOW: Math.round(finalAOWAnnual),
    partnerAOW: Math.round(partnerAOW),
    totalAOW: Math.round(totalAOW),
    reductionPercentage: Math.round(totalReductionPercentage * 100),
    reductionAmount: Math.round(reductionAmount),
    fullAOWAge,
    advice
  }
}