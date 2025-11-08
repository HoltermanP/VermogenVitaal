import { CryptoAllocationInput } from "@/lib/validations/calculators"

export interface CryptoAllocationResult {
  recommendedAllocation: number
  allocationRange: {
    min: number
    max: number
  }
  riskWarnings: string[]
  custodyAdvice: string[]
  diversificationAdvice: string[]
  educationalContent: string[]
}

export function calculateCryptoAllocation(input: CryptoAllocationInput): CryptoAllocationResult {
  const { riskProfile, totalPortfolio, illiquidAssets, cryptoExperience, timeHorizon } = input

  // Basis allocatie op basis van risicoprofiel
  let baseAllocation = 0
  let minAllocation = 0
  let maxAllocation = 0

  switch (riskProfile) {
    case 'CONSERVATIVE':
      baseAllocation = 2
      minAllocation = 0
      maxAllocation = 5
      break
    case 'MODERATE':
      baseAllocation = 5
      minAllocation = 2
      maxAllocation = 10
      break
    case 'AGGRESSIVE':
      baseAllocation = 10
      minAllocation = 5
      maxAllocation = 20
      break
  }

  // Aanpassingen op basis van ervaring
  if (cryptoExperience === 'BEGINNER') {
    baseAllocation = Math.max(0, baseAllocation - 2)
    maxAllocation = Math.max(2, maxAllocation - 3)
  } else if (cryptoExperience === 'ADVANCED') {
    baseAllocation = Math.min(25, baseAllocation + 3)
    maxAllocation = Math.min(30, maxAllocation + 5)
  }

  // Aanpassingen op basis van beleggingshorizon
  if (timeHorizon < 3) {
    baseAllocation = Math.max(0, baseAllocation - 3)
    maxAllocation = Math.max(2, maxAllocation - 5)
  } else if (timeHorizon > 10) {
    baseAllocation = Math.min(25, baseAllocation + 2)
    maxAllocation = Math.min(30, maxAllocation + 3)
  }

  // Risicowaarschuwingen
  const riskWarnings: string[] = []
  
  if (baseAllocation > 10) {
    riskWarnings.push("Hoge crypto allocatie kan portefeuille volatiliteit sterk verhogen")
  }
  
  if (timeHorizon < 5) {
    riskWarnings.push("Korte beleggingshorizon kan risicovol zijn voor crypto")
  }
  
  if (cryptoExperience === 'BEGINNER') {
    riskWarnings.push("Crypto is complex - begin klein en leer eerst")
  }

  // Custody advies
  const custodyAdvice: string[] = []
  
  if (baseAllocation > 5) {
    custodyAdvice.push("Overweeg hardware wallet voor grote bedragen")
    custodyAdvice.push("Diversificeer over meerdere exchanges")
  }
  
  custodyAdvice.push("Gebruik 2FA en sterke wachtwoorden")
  custodyAdvice.push("Bewaar recovery phrases veilig offline")

  // Diversificatie advies
  const diversificationAdvice: string[] = []
  
  if (baseAllocation > 0) {
    diversificationAdvice.push("Diversificeer over Bitcoin en Ethereum")
    diversificationAdvice.push("Overweeg ook traditionele assets")
  }
  
  if (illiquidAssets > totalPortfolio * 0.3) {
    diversificationAdvice.push("Hoge illiquide allocatie - houd voldoende liquiditeit")
  }

  // Educatieve content
  const educationalContent: string[] = []
  
  if (cryptoExperience === 'BEGINNER') {
    educationalContent.push("Leer over blockchain technologie")
    educationalContent.push("Begrijp de risico's van crypto")
    educationalContent.push("Start met kleine bedragen")
  }
  
  educationalContent.push("Volg regelmatig crypto nieuws")
  educationalContent.push("Overweeg DCA (Dollar Cost Averaging)")

  return {
    recommendedAllocation: baseAllocation,
    allocationRange: {
      min: minAllocation,
      max: maxAllocation
    },
    riskWarnings,
    custodyAdvice,
    diversificationAdvice,
    educationalContent
  }
}
