export interface EmergencyFundInput {
  monthlyExpenses: number
  desiredMonths: number
  currentSavings: number
  monthlySavings: number
  expectedReturn: number
  riskTolerance: 'low' | 'medium' | 'high'
  hasStableIncome: boolean
  hasPartner: boolean
  dependents: number
}

export interface EmergencyFundResult {
  recommendedAmount: number
  shortfall: number
  timeToBuild: number
  monthlyRequired: number
  currentCoverage: number
  riskAdjustedMonths: number
  investmentSuggestion: string
  alternatives: string[]
  advice: string[]
}

export function calculateEmergencyFund(input: EmergencyFundInput): EmergencyFundResult {
  const {
    monthlyExpenses,
    desiredMonths = 6,
    currentSavings = 0,
    monthlySavings = 0,
    expectedReturn = 3,
    riskTolerance = 'medium',
    hasStableIncome = true,
    hasPartner = false,
    dependents = 0
  } = input

  // Basis aanbeveling aanpassen gebaseerd op situatie
  let adjustedMonths = desiredMonths

  // Meer maanden voor instabiele situatie
  if (!hasStableIncome) adjustedMonths += 2
  if (!hasPartner && dependents > 0) adjustedMonths += 1
  if (dependents > 2) adjustedMonths += 1

  // Minimum 3 maanden, maximum 24 maanden
  adjustedMonths = Math.max(3, Math.min(24, adjustedMonths))

  // Aanbevolen bedrag
  const recommendedAmount = monthlyExpenses * adjustedMonths

  // Huidige dekking
  const currentCoverage = currentSavings / monthlyExpenses
  const shortfall = Math.max(0, recommendedAmount - currentSavings)

  // Tijd om buffer op te bouwen
  let timeToBuild = 0
  if (shortfall > 0 && monthlySavings > 0) {
    // Met maandelijks sparen
    timeToBuild = shortfall / monthlySavings
  }

  // Maandelijks benodigd bedrag om in X maanden op te bouwen
  const targetMonths = 12 // Gemiddeld doel: 1 jaar
  const monthlyRequired = shortfall > 0 ? shortfall / targetMonths : 0

  // Investeringssuggestie gebaseerd op risicotolerantie
  let investmentSuggestion = ""
  if (riskTolerance === 'low') {
    investmentSuggestion = "Spaarrekening of deposito - directe beschikbaarheid"
  } else if (riskTolerance === 'medium') {
    investmentSuggestion = "Mix van spaarrekening en kortlopende obligaties"
  } else {
    investmentSuggestion = "Spaarrekening aangevuld met ETF's voor hogere rente"
  }

  // Alternatieven
  const alternatives: string[] = []
  if (shortfall > monthlyExpenses * 12) {
    alternatives.push("Overweeg een doorlopend krediet als aanvulling")
  }
  if (!hasPartner) {
    alternatives.push("Bouw netwerk van familie/vrienden voor ondersteuning")
  }
  alternatives.push("Zorgverzekering met ruim eigen risico voor extra dekking")
  alternatives.push("Creditcard met rentevrije periode als noodoptie")

  // Advies genereren
  const advice: string[] = []

  if (currentCoverage < 3) {
    advice.push("URGENT: Je buffer is te laag - bouw eerst minimaal 3 maanden op")
  } else if (currentCoverage >= adjustedMonths) {
    advice.push("Goed gedaan! Je buffer is toereikend")
  } else {
    advice.push(`Bouw op naar ${adjustedMonths} maanden voor optimale bescherming`)
  }

  if (timeToBuild > 24) {
    advice.push("Opbouwen duurt lang - overweeg tijdelijk bijverdienen")
  }

  if (!hasStableIncome) {
    advice.push("Instabiele inkomsten - bouw extra grote buffer op")
  }

  if (dependents > 0) {
    advice.push(`Met ${dependents} afhankelijk${dependents > 1 ? 'en' : ''} is extra buffer essentieel`)
  }

  if (expectedReturn > 4) {
    advice.push("Hoge verwachtingen voor noodfonds - denk aan beschikbaarheid")
  }

  if (monthlySavings === 0) {
    advice.push(`Start met minimaal €${Math.round(monthlyRequired).toLocaleString('nl-NL')}/maand sparen`)
  }

  return {
    recommendedAmount: Math.round(recommendedAmount),
    shortfall: Math.round(shortfall),
    timeToBuild: Math.round(timeToBuild * 10) / 10,
    monthlyRequired: Math.round(monthlyRequired),
    currentCoverage: Math.round(currentCoverage * 10) / 10,
    riskAdjustedMonths: adjustedMonths,
    investmentSuggestion,
    alternatives,
    advice
  }
}