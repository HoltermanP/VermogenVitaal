export interface AOWInput {
  birthDate: string // YYYY-MM-DD
  yearsWorked: number
  yearsAbroad?: number
  hasPartner?: boolean
  partnerBirthDate?: string
}

export interface AOWResult {
  aowAge: number
  aowDate: string
  buildUpPercentage: number
  monthlyAOW: number
  partnerAOW?: number
  totalMonthlyAOW: number
  advice: string[]
}

export function calculateAOW(input: AOWInput): AOWResult {
  const {
    birthDate,
    yearsWorked,
    yearsAbroad = 0,
    hasPartner = false,
    partnerBirthDate
  } = input

  const birth = new Date(birthDate)
  const currentYear = new Date().getFullYear()
  const birthYear = birth.getFullYear()

  // AOW-leeftijd bepaling (vereenvoudigd - in werkelijkheid complexer)
  let aowAge = 67
  if (birthYear >= 1960) {
    // Stapsgewijze verhoging
    const yearsOver1960 = birthYear - 1960
    aowAge = 67 + Math.floor(yearsOver1960 / 2) * 0.5
  }

  const aowDate = new Date(birthYear + aowAge, birth.getMonth(), birth.getDate())

  // Opbouwpercentage (50 jaar opbouw = 100%)
  const totalYears = 50
  const yearsInNetherlands = Math.min(yearsWorked - yearsAbroad, totalYears)
  const buildUpPercentage = Math.min((yearsInNetherlands / totalYears) * 100, 100)

  // AOW-bedrag 2025 (vereenvoudigd)
  const fullAOWSingle = 1350 // Per maand
  const fullAOWPartner = 920 // Per maand (bij partnerschap)

  const monthlyAOW = (fullAOWSingle * buildUpPercentage) / 100

  let partnerAOW: number | undefined
  let totalMonthlyAOW = monthlyAOW

  if (hasPartner && partnerBirthDate) {
    const partnerBirth = new Date(partnerBirthDate)
    const partnerBirthYear = partnerBirth.getFullYear()
    let partnerAOWAge = 67
    if (partnerBirthYear >= 1960) {
      const yearsOver1960 = partnerBirthYear - 1960
      partnerAOWAge = 67 + Math.floor(yearsOver1960 / 2) * 0.5
    }
    partnerAOW = (fullAOWPartner * buildUpPercentage) / 100
    totalMonthlyAOW = monthlyAOW + partnerAOW
  }

  const advice: string[] = []
  if (buildUpPercentage < 100) {
    advice.push(`Je hebt ${buildUpPercentage.toFixed(1)}% AOW opgebouwd`)
    if (yearsAbroad > 0) {
      advice.push("Jaren in het buitenland tellen niet mee voor AOW-opbouw")
    }
  } else {
    advice.push("Je hebt volledige AOW opgebouwd")
  }

  if (aowAge > 67) {
    advice.push(`Je AOW-leeftijd is ${aowAge} jaar`)
  }

  if (monthlyAOW < fullAOWSingle * 0.8) {
    advice.push("Overweeg aanvullend pensioen voor hoger inkomen")
  }

  return {
    aowAge,
    aowDate: aowDate.toISOString().split('T')[0],
    buildUpPercentage,
    monthlyAOW,
    partnerAOW,
    totalMonthlyAOW,
    advice
  }
}












