import { getTaxRates, type TaxYear } from "../tax-rates"

export interface SelfEmployedInput {
  profit: number
  hoursWorked: number
  partnerHours?: number
  isStarter?: boolean
  yearsActive?: number
  year?: TaxYear
}

export interface SelfEmployedResult {
  hoursCheck: {
    required: number
    actual: number
    partnerHours?: number
    total: number
    qualifies: boolean
  }
  deductions: {
    selfEmployed: number
    starter: number
    mkbProfitExemption: number
    total: number
  }
  taxableProfit: number
  taxSavings: number
  advice: string[]
}

export function calculateSelfEmployed(input: SelfEmployedInput): SelfEmployedResult {
  const {
    profit,
    hoursWorked,
    partnerHours = 0,
    isStarter = false,
    yearsActive = 0,
    year = 2025
  } = input

  const rates = getTaxRates(year).selfEmployed

  // Urencriterium
  const requiredHours = 1225
  const partnerRequiredHours = 800
  const totalHours = hoursWorked + (partnerHours >= partnerRequiredHours ? partnerHours : 0)
  const qualifies = totalHours >= requiredHours

  // Zelfstandigenaftrek (jaar-specifiek)
  const selfEmployedDeduction = qualifies ? rates.selfEmployedDeduction : 0

  // Startersaftrek (eerste 5 jaar)
  const starterDeduction = (isStarter && yearsActive <= 5 && qualifies) ? rates.starterDeduction : 0

  // MKB-winstvrijstelling (jaar-specifiek)
  const mkbProfitExemption = qualifies ? Math.min(profit * rates.mkbProfitExemptionRate, rates.mkbProfitExemptionMax) : 0

  const deductions = {
    selfEmployed: selfEmployedDeduction,
    starter: starterDeduction,
    mkbProfitExemption,
    total: selfEmployedDeduction + starterDeduction + mkbProfitExemption
  }

  // Belastbare winst
  const taxableProfit = Math.max(0, profit - deductions.total)

  // Belastingbesparing (gemiddeld tarief 37%)
  const taxSavings = deductions.total * 0.37

  // Advies
  const advice: string[] = []
  if (!qualifies) {
    const missingHours = requiredHours - totalHours
    advice.push(`Je mist ${missingHours} uur om recht te hebben op de aftrekposten`)
    advice.push("Overweeg om meer uren te werken of je partner te laten meewerken")
  } else {
    advice.push("Je voldoet aan het urencriterium")
  }

  if (isStarter && yearsActive <= 5) {
    advice.push(`Je hebt nog ${5 - yearsActive} jaar recht op startersaftrek`)
  }

  if (mkbProfitExemption > 0) {
    advice.push(`MKB-winstvrijstelling: €${Math.round(mkbProfitExemption).toLocaleString('nl-NL')}`)
  }

  return {
    hoursCheck: {
      required: requiredHours,
      actual: hoursWorked,
      partnerHours: partnerHours >= partnerRequiredHours ? partnerHours : 0,
      total: totalHours,
      qualifies
    },
    deductions,
    taxableProfit,
    taxSavings,
    advice
  }
}

