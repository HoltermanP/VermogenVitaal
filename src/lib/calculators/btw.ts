export interface BTWInput {
  amount: number
  rate: 'high' | 'low' | 'zero'
  calculation: 'incl' | 'excl' | 'refund'
  isSmallBusiness?: boolean
  annualTurnover?: number
}

export interface BTWResult {
  amountExcl: number
  amountIncl: number
  btwAmount: number
  rate: number
  ratePercentage: string
  smallBusinessExemption: boolean
  refund?: number
  advice: string[]
}

export function calculateBTW(input: BTWInput): BTWResult {
  const {
    amount,
    rate,
    calculation,
    isSmallBusiness = false,
    annualTurnover = 0
  } = input

  // BTW tarieven 2025
  const rates = {
    high: 0.21, // 21%
    low: 0.09, // 9%
    zero: 0 // 0%
  }

  const btwRate = rates[rate]
  const ratePercentage = rate === 'high' ? '21%' : rate === 'low' ? '9%' : '0%'

  // Kleineondernemersregeling
  const smallBusinessExemption = isSmallBusiness && annualTurnover < 20000

  let amountExcl = 0
  let amountIncl = 0
  let btwAmount = 0
  let refund: number | undefined = undefined

  if (calculation === 'incl') {
    // Bedrag inclusief BTW
    amountIncl = amount
    amountExcl = amount / (1 + btwRate)
    btwAmount = amount - amountExcl
  } else if (calculation === 'excl') {
    // Bedrag exclusief BTW
    amountExcl = amount
    btwAmount = amount * btwRate
    amountIncl = amount + btwAmount
  } else if (calculation === 'refund') {
    // BTW teruggaaf
    amountExcl = amount
    btwAmount = amount * btwRate
    refund = smallBusinessExemption ? 0 : btwAmount
  }

  // Advies
  const advice: string[] = []
  if (smallBusinessExemption) {
    advice.push("Je komt in aanmerking voor de kleineondernemersregeling")
    advice.push("Je hoeft geen BTW af te dragen bij omzet onder €20.000")
  } else {
    advice.push("BTW-tarief: " + ratePercentage)
    if (rate === 'low') {
      advice.push("Verlaagd tarief geldt voor o.a. voedingsmiddelen, boeken, medicijnen")
    }
  }

  if (refund !== undefined && refund > 0) {
    advice.push(`Je kunt €${Math.round(refund).toLocaleString('nl-NL')} BTW terugkrijgen`)
  }

  return {
    amountExcl: Math.round(amountExcl * 100) / 100,
    amountIncl: Math.round(amountIncl * 100) / 100,
    btwAmount: Math.round(btwAmount * 100) / 100,
    rate: btwRate,
    ratePercentage,
    smallBusinessExemption,
    refund,
    advice
  }
}

