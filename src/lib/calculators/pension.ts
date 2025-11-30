export interface PensionInput {
  income: number
  pensionRights: number
  age: number
  yearsBack?: number
  hasPartner?: boolean
}

export interface PensionResult {
  yearSpace: number
  reservationSpace: number
  totalSpace: number
  maxDeductible: number
  taxSavings: number
  netCost: number
  advice: string[]
}

export function calculatePension(input: PensionInput): PensionResult {
  const {
    income,
    pensionRights = 0,
    age,
    yearsBack = 7,
    hasPartner = false
  } = input

  // Jaarruimte berekening 2025
  // Factor A (inkomensfactor)
  const factorA = income * 0.13
  
  // Factor B (pensioenrechtenfactor)
  const factorB = pensionRights * 1.032 // 3.2% indexatie
  
  // Factor C (franchise)
  const franchise = hasPartner ? 16020 : 16020 // Zelfde voor 2025
  
  const yearSpace = Math.max(0, factorA - factorB - franchise)
  const maxYearSpace = 17000 // Maximum jaarruimte 2025

  // Reserveringsruimte (tot 7 jaar terug)
  // Vereenvoudigd: 10% van jaarruimte per jaar
  const reservationSpace = Math.min(yearSpace * yearsBack * 0.1, maxYearSpace * yearsBack)

  // Totale ruimte
  const totalSpace = Math.min(yearSpace + reservationSpace, maxYearSpace * (1 + yearsBack))

  // Maximale aftrekbare premie
  const maxDeductible = Math.min(totalSpace, maxYearSpace * 2) // Max 2x jaarruimte

  // Belastingbesparing (gemiddeld tarief 37%)
  const taxSavings = maxDeductible * 0.37

  // Netto kosten
  const netCost = maxDeductible - taxSavings

  // Advies
  const advice: string[] = []
  if (yearSpace > 0) {
    advice.push(`Je hebt €${Math.round(yearSpace).toLocaleString('nl-NL')} jaarruimte beschikbaar`)
  } else {
    advice.push("Je hebt geen jaarruimte dit jaar")
  }
  
  if (reservationSpace > 0) {
    advice.push(`Je kunt nog €${Math.round(reservationSpace).toLocaleString('nl-NL')} reserveringsruimte gebruiken`)
  }

  if (age < 30) {
    advice.push("Start vroeg met pensioenopbouw voor maximale groei")
  } else if (age > 50) {
    advice.push("Overweeg extra pensioenopbouw via reserveringsruimte")
  }

  return {
    yearSpace: Math.min(yearSpace, maxYearSpace),
    reservationSpace: Math.min(reservationSpace, maxYearSpace * yearsBack),
    totalSpace: Math.min(totalSpace, maxYearSpace * (1 + yearsBack)),
    maxDeductible,
    taxSavings,
    netCost,
    advice
  }
}

