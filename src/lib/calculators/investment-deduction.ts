export interface InvestmentDeductionInput {
  investmentAmount: number
  investmentType: 'mia' | 'eia' | 'kia' | 'vamil'
  environmentalCategory?: 'category1' | 'category2' | 'category3'
  energyCategory?: 'category1' | 'category2' | 'category3'
}

export interface InvestmentDeductionResult {
  investmentAmount: number
  deduction: {
    percentage: number
    amount: number
    type: string
  }
  taxSavings: number
  netCost: number
  canCombine: boolean
  advice: string[]
}

export function calculateInvestmentDeduction(input: InvestmentDeductionInput): InvestmentDeductionResult {
  const {
    investmentAmount,
    investmentType,
    environmentalCategory = 'category1',
    energyCategory = 'category1'
  } = input

  let deductionPercentage = 0
  let deductionType = ''

  // MIA (Milieu-investeringsaftrek)
  if (investmentType === 'mia') {
    const miaRates = {
      category1: 0.36, // 36%
      category2: 0.27, // 27%
      category3: 0.13 // 13%
    }
    deductionPercentage = miaRates[environmentalCategory] || 0.36
    deductionType = 'MIA (Milieu-investeringsaftrek)'
  }

  // EIA (Energie-investeringsaftrek)
  if (investmentType === 'eia') {
    const eiaRates = {
      category1: 0.455, // 45.5%
      category2: 0.36, // 36%
      category3: 0.27 // 27%
    }
    deductionPercentage = eiaRates[energyCategory] || 0.455
    deductionType = 'EIA (Energie-investeringsaftrek)'
  }

  // KIA (Kleinschaligheidsinvesteringsaftrek)
  if (investmentType === 'kia') {
    if (investmentAmount <= 2500) {
      deductionPercentage = 0.28 // 28%
    } else if (investmentAmount <= 50000) {
      deductionPercentage = 0.21 // 21%
    } else if (investmentAmount <= 125000) {
      deductionPercentage = 0.14 // 14%
    } else {
      deductionPercentage = 0.075 // 7.5%
    }
    deductionType = 'KIA (Kleinschaligheidsinvesteringsaftrek)'
  }

  // VAMIL (Willekeurige afschrijving milieu-investeringen)
  if (investmentType === 'vamil') {
    deductionPercentage = 0.75 // 75% willekeurig afschrijven
    deductionType = 'VAMIL (Willekeurige afschrijving)'
  }

  const deductionAmount = investmentAmount * deductionPercentage

  // Belastingbesparing (gemiddeld tarief 25%)
  const taxSavings = deductionAmount * 0.25

  // Netto kosten
  const netCost = investmentAmount - taxSavings

  // Combinatie mogelijkheden
  const canCombine = investmentType === 'mia' || investmentType === 'eia'

  // Advies
  const advice: string[] = []
  advice.push(`${deductionType}: ${(deductionPercentage * 100).toFixed(1)}%`)
  advice.push(`Aftrekbedrag: €${Math.round(deductionAmount).toLocaleString('nl-NL')}`)
  advice.push(`Belastingbesparing: €${Math.round(taxSavings).toLocaleString('nl-NL')}`)

  if (canCombine) {
    advice.push("MIA/EIA kunnen gecombineerd worden met VAMIL")
  }

  if (investmentType === 'kia' && investmentAmount > 125000) {
    advice.push("Bij investeringen boven €125.000 is KIA percentage lager")
  }

  return {
    investmentAmount,
    deduction: {
      percentage: deductionPercentage,
      amount: deductionAmount,
      type: deductionType
    },
    taxSavings,
    netCost,
    canCombine,
    advice
  }
}

