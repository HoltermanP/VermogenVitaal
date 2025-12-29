export interface BufferCalculatorInput {
  monthlyIncome: number
  monthlyExpenses: number
  employmentType: 'employee' | 'self-employed' | 'pensioner'
  dependents: number
  hasEmergencyFund: boolean
}

export interface BufferCalculatorResult {
  recommendedBuffer: number
  minimumBuffer: number
  comfortableBuffer: number
  monthsCovered: number
  advice: string[]
}

export function calculateBuffer(input: BufferCalculatorInput): BufferCalculatorResult {
  const {
    monthlyIncome,
    monthlyExpenses,
    employmentType,
    dependents,
    hasEmergencyFund
  } = input

  // Basis buffer: 3-6 maanden uitgaven
  let minimumMonths = 3
  let recommendedMonths = 6
  let comfortableMonths = 12

  // Aanpassingen op basis van situatie
  if (employmentType === 'self-employed') {
    minimumMonths = 6
    recommendedMonths = 12
    comfortableMonths = 18
  } else if (employmentType === 'pensioner') {
    minimumMonths = 6
    recommendedMonths = 12
    comfortableMonths = 24
  }

  // Extra buffer voor dependents
  const dependentMultiplier = 1 + (dependents * 0.2)

  const minimumBuffer = monthlyExpenses * minimumMonths * dependentMultiplier
  const recommendedBuffer = monthlyExpenses * recommendedMonths * dependentMultiplier
  const comfortableBuffer = monthlyExpenses * comfortableMonths * dependentMultiplier

  // Huidige buffer (vereenvoudigd - zou uit database moeten komen)
  const currentBuffer = hasEmergencyFund ? recommendedBuffer * 0.5 : 0
  const monthsCovered = currentBuffer / monthlyExpenses

  const advice: string[] = []
  if (monthsCovered < minimumMonths) {
    advice.push(`Bouw eerst een minimale buffer op van €${Math.round(minimumBuffer).toLocaleString('nl-NL')}`)
  } else if (monthsCovered < recommendedMonths) {
    advice.push(`Streef naar een buffer van €${Math.round(recommendedBuffer).toLocaleString('nl-NL')}`)
  } else {
    advice.push("Je hebt een goede buffer opgebouwd")
  }

  if (employmentType === 'self-employed') {
    advice.push("Zelfstandigen hebben meer buffer nodig vanwege onzeker inkomen")
  }

  if (dependents > 0) {
    advice.push(`Met ${dependents} afhankelijke(n) is extra buffer aanbevolen`)
  }

  return {
    recommendedBuffer,
    minimumBuffer,
    comfortableBuffer,
    monthsCovered,
    advice
  }
}


















