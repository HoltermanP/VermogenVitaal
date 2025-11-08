import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create knowledge articles
  const knowledgeArticles = [
    {
      title: "Inkomstenbelasting voor ondernemers 2024",
      slug: "inkomstenbelasting-ondernemers-2024",
      tags: ["inkomstenbelasting", "ondernemers", "2024"],
      jurisdiction: "NL",
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-12-31"),
      version: "1.0",
      body: `# Inkomstenbelasting voor ondernemers 2024

## Belangrijke wijzigingen

De inkomstenbelasting voor ondernemers is in 2024 aangepast met nieuwe tarieven en regels.

### Belastingschijven 2024

- **Schijf 1 (€0 - €75.000)**: 36,97%
- **Schijf 2 (€75.000+)**: 49,50%

### Zelfstandigenaftrek

De zelfstandigenaftrek bedraagt in 2024 €12.200. Dit is een forfaitaire aftrek voor ondernemers.

### Startersaftrek

Nieuwe ondernemers kunnen gebruik maken van de startersaftrek van €2.123 in 2024.

## Praktische tips

1. Houd je administratie goed bij
2. Maak gebruik van alle aftrekposten
3. Overweeg pensioenopbouw
4. Plan je uitbetalingen strategisch

## Disclaimer

Deze informatie is algemeen van aard. Raadpleeg altijd een belastingadviseur voor maatwerkadvies.`
    },
    {
      title: "Vennootschapsbelasting en DGA salaris 2024",
      slug: "vennootschapsbelasting-dga-2024",
      tags: ["vennootschapsbelasting", "DGA", "BV", "2024"],
      jurisdiction: "NL",
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-12-31"),
      version: "1.0",
      body: `# Vennootschapsbelasting en DGA salaris 2024

## Vennootschapsbelasting tarieven

De vennootschapsbelasting (VPB) kent in 2024 de volgende tarieven:

- **Tot €200.000**: 19%
- **Vanaf €200.000**: 25,8%

## MKB-winstvrijstelling

De MKB-winstvrijstelling bedraagt 24% van de winst tot €200.000. Dit betekent een effectief tarief van 14,44% voor de eerste €200.000.

## DGA salaris

Het DGA salaris moet marktconform zijn. De Belastingdienst hanteert richtlijnen voor het minimum DGA salaris.

### Minimum DGA salaris 2024

- **Bij winst tot €200.000**: €51.000
- **Bij winst vanaf €200.000**: €75.000

## Dividendbelasting

Dividenduitkeringen zijn belast tegen 26,5% dividendbelasting.

## Praktische overwegingen

1. Optimaliseer de verhouding tussen DGA salaris en dividend
2. Houd rekening met de MKB-winstvrijstelling
3. Overweeg pensioenopbouw via de BV
4. Plan je uitbetalingen strategisch

## Disclaimer

Deze informatie is algemeen van aard. Raadpleeg altijd een belastingadviseur voor maatwerkadvies.`
    },
    {
      title: "Box 3 vermogensbelasting 2024",
      slug: "box3-vermogensbelasting-2024",
      tags: ["box3", "vermogensbelasting", "beleggen", "2024"],
      jurisdiction: "NL",
      effectiveFrom: new Date("2024-01-01"),
      effectiveTo: new Date("2024-12-31"),
      version: "1.0",
      body: `# Box 3 vermogensbelasting 2024

## Box 3 tarieven 2024

De vermogensbelasting in Box 3 kent in 2024 de volgende tarieven:

- **Spaarrekeningen**: 0,36%
- **Beleggingen**: 1,97%
- **Overige bezittingen**: 1,97%

## Heffingsvrij vermogen

Het heffingsvrij vermogen bedraagt in 2024:
- **Alleenstaanden**: €57.000
- **Partners**: €114.000

## Beleggingscategorieën

### Categorie 1: Spaarrekeningen
- Banktegoeden
- Cash
- Deposito's

### Categorie 2: Beleggingen
- Aandelen
- Obligaties
- ETF's
- Crypto (indien als belegging)

### Categorie 3: Overige bezittingen
- Vastgoed (indien niet in Box 1)
- Edelmetalen
- Overige bezittingen

## Praktische tips

1. Optimaliseer je vermogensmix
2. Houd rekening met de verschillende tarieven
3. Overweeg spreiding over categorieën
4. Plan je uitbetalingen strategisch

## Disclaimer

Deze informatie is algemeen van aard. Raadpleeg altijd een belastingadviseur voor maatwerkadvies.`
    }
  ]

  for (const article of knowledgeArticles) {
    await prisma.knowledge.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    })
  }

  console.log('✅ Knowledge articles created')

  // Create example scenarios
  const exampleScenarios = [
    {
      type: 'BV_VS_EMZ' as const,
      inputs: {
        revenue: 100000,
        costs: 20000,
        dgaSalary: 50000,
        employerCosts: 10000,
        dividend: 20000,
        mkbProfitExemption: true,
        selfEmployedDeduction: false,
        starterDeduction: false,
        pension: 5000,
        dgaPension: 10000
      },
      results: {
        emz: {
          netIncome: 65000,
          totalTax: 15000,
          effectiveRate: 18.75
        },
        bv: {
          netIncome: 68000,
          totalTax: 12000,
          effectiveRate: 15.0
        },
        comparison: {
          difference: 3000,
          percentageDifference: 4.6,
          recommendation: "BV"
        }
      }
    },
    {
      type: 'ETF_GROWTH' as const,
      inputs: {
        initialInvestment: 10000,
        monthlyContribution: 500,
        expectedReturn: 7,
        pessimisticReturn: 4,
        optimisticReturn: 10,
        ter: 0.2,
        duration: 20,
        rebalancing: true,
        box3Rate: 1.97
      },
      results: {
        finalValue: 250000,
        totalInvested: 130000,
        totalReturn: 120000,
        returnPercentage: 92.3,
        costImpact: 5000
      }
    }
  ]

  // Note: We can't create scenarios without a user, so we'll skip this for now
  console.log('✅ Example scenarios prepared')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
