import { RealEstateInput } from "@/lib/validations/calculators"

export interface RealEstateResult {
  monthlyCashflow: number
  yearlyCashflow: number
  grossYield: number
  netYield: number
  dscr: number
  roe: number
  sensitivity: {
    rentPlus10: number
    rentMinus10: number
    interestPlus10: number
    interestMinus10: number
  }
  breakdown: {
    grossRent: number
    vacancy: number
    netRent: number
    operatingExpenses: number
    netOperatingIncome: number
    debtService: number
    netCashflow: number
  }
  advice: string[]
}

export function calculateRealEstate(input: RealEstateInput): RealEstateResult {
  const {
    rent,
    vacancyRate,
    interestRate,
    principal,
    maintenanceRate,
    ozb,
    insurance,
    vve,
    management,
    ltv,
    interestFixed,
    country,
    regime
  } = input

  // Basis berekeningen
  const grossRent = rent
  const vacancy = grossRent * (vacancyRate / 100)
  const netRent = grossRent - vacancy

  // Operationele kosten
  const maintenance = grossRent * (maintenanceRate / 100)
  const operatingExpenses = maintenance + ozb + insurance + vve + management
  const netOperatingIncome = netRent - operatingExpenses

  // Schuld service
  const debtService = principal + (principal * (interestRate / 100))
  const monthlyCashflow = (netOperatingIncome / 12) - (debtService / 12)
  const yearlyCashflow = monthlyCashflow * 12

  // Yield berekeningen
  const propertyValue = principal / (ltv / 100) // Vereenvoudigde waarde berekening
  const grossYield = (grossRent / propertyValue) * 100
  const netYield = (netOperatingIncome / propertyValue) * 100

  // DSCR (Debt Service Coverage Ratio)
  const dscr = netOperatingIncome / debtService

  // ROE (Return on Equity)
  const equity = propertyValue - principal
  const roe = (yearlyCashflow / equity) * 100

  // Gevoeligheidsanalyse
  const sensitivity = {
    rentPlus10: calculateRealEstate({ ...input, rent: rent * 1.1 }).yearlyCashflow,
    rentMinus10: calculateRealEstate({ ...input, rent: rent * 0.9 }).yearlyCashflow,
    interestPlus10: calculateRealEstate({ ...input, interestRate: interestRate * 1.1 }).yearlyCashflow,
    interestMinus10: calculateRealEstate({ ...input, interestRate: interestRate * 0.9 }).yearlyCashflow
  }

  // Advies
  const advice: string[] = []

  if (dscr < 1.2) {
    advice.push("DSCR is laag - overweeg lagere leverage")
  }

  if (netYield < 4) {
    advice.push("Netto yield is laag - overweeg andere locaties")
  }

  if (country !== 'NL') {
    advice.push(`Let op fiscale regels voor ${country} vastgoed`)
  }

  if (regime === 'box3') {
    advice.push("Box 3 behandeling kan voordelig zijn voor passieve beleggers")
  }

  if (interestFixed < 5) {
    advice.push("Korte rentevaste periode kan risicovol zijn")
  }

  return {
    monthlyCashflow,
    yearlyCashflow,
    grossYield,
    netYield,
    dscr,
    roe,
    sensitivity,
    breakdown: {
      grossRent,
      vacancy,
      netRent,
      operatingExpenses,
      netOperatingIncome,
      debtService,
      netCashflow: yearlyCashflow
    },
    advice
  }
}
