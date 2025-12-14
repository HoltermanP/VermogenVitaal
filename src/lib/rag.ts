import { prisma } from "@/lib/prisma"

export interface RAGInput {
  scenario: string
  profile: {
    legalForm?: string
    revenue?: number
    goals?: string[]
    riskProfile?: string
  }
}

export interface RAGResult {
  summary: string
  attentionPoints: string[]
  sources: Array<{
    title: string
    slug: string
    effectiveFrom: Date
    version: string
  }>
  disclaimer: string
  generatedAt: Date
}

interface KnowledgeArticle {
  title: string
  body: string
  slug: string
  effectiveFrom: Date
  version: string
}

export interface CommunityQuestion {
  id: string
  title: string
  content: string
  category: string
  author: string
}

export interface CommunityAnswer {
  id: string
  author: string
  content: string
  isExpert: boolean
  votes: number
  date: string
}

export async function generateRAGSummary(input: RAGInput): Promise<RAGResult> {
  const { scenario, profile } = input

  // Zoek relevante knowledge artikelen
  const relevantArticles = await findRelevantArticles(scenario, profile)
  
  // Genereer samenvatting (vereenvoudigd - in productie zou je OpenAI gebruiken)
  const summary = generateSummary(scenario, profile, relevantArticles)
  
  // Extract aandachtspunten
  const attentionPoints = extractAttentionPoints(relevantArticles)
  
  // Bronnen
  const sources = relevantArticles.map(article => ({
    title: article.title,
    slug: article.slug,
    effectiveFrom: article.effectiveFrom,
    version: article.version
  }))

  return {
    summary,
    attentionPoints,
    sources,
    disclaimer: "Deze informatie is uitsluitend bedoeld voor educatieve doeleinden en vormt geen persoonlijke financiële ondersteuning. Raadpleeg altijd een gekwalificeerde adviseur voor maatwerkbegeleiding.",
    generatedAt: new Date()
  }
}

async function findRelevantArticles(scenario: string, profile: RAGInput['profile']) {
  // Zoek artikelen op basis van scenario en profiel
  const searchTerms = extractSearchTerms(scenario, profile)
  
  const articles = await prisma.knowledge.findMany({
    where: {
      AND: [
        {
          OR: searchTerms.map(term => ({
            OR: [
              { title: { contains: term, mode: 'insensitive' } },
              { body: { contains: term, mode: 'insensitive' } },
              { tags: { has: term } }
            ]
          }))
        },
        {
          effectiveFrom: { lte: new Date() },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: new Date() } }
          ]
        }
      ]
    },
    orderBy: { effectiveFrom: 'desc' },
    take: 5
  })

  return articles
}

function extractSearchTerms(scenario: string, profile: RAGInput['profile']): string[] {
  const terms: string[] = []
  
  // Scenario-specifieke termen
  if (scenario.includes('BV') || scenario.includes('EMZ')) {
    terms.push('inkomstenbelasting', 'vennootschapsbelasting', 'DGA')
  }
  
  if (scenario.includes('ETF') || scenario.includes('beleggen')) {
    terms.push('box 3', 'vermogensbelasting', 'ETF')
  }
  
  if (scenario.includes('vastgoed') || scenario.includes('pand')) {
    terms.push('vastgoed', 'box 3', 'inkomstenbelasting')
  }
  
  if (scenario.includes('crypto') || scenario.includes('bitcoin')) {
    terms.push('crypto', 'digitale valuta', 'box 3')
  }

  // Profiel-specifieke termen
  if (profile.legalForm === 'BV') {
    terms.push('vennootschapsbelasting', 'DGA')
  }
  
  if (profile.legalForm === 'EMZ') {
    terms.push('inkomstenbelasting', 'zelfstandigenaftrek')
  }

  return [...new Set(terms)] // Remove duplicates
}

function generateSummary(scenario: string, profile: RAGInput['profile'], articles: KnowledgeArticle[]): string {
  // Vereenvoudigde samenvatting - in productie zou je OpenAI gebruiken
  let summary = `Op basis van uw scenario "${scenario}" en profiel zijn de volgende punten relevant:\n\n`
  
  if (articles.length > 0) {
    summary += `De meest actuele informatie komt uit artikelen over ${articles.map(a => a.title).join(', ')}.\n\n`
  }
  
  summary += "Belangrijke overwegingen:\n"
  summary += "- Controleer altijd de meest recente fiscale regels\n"
  summary += "- Overweeg professionele begeleiding voor complexe situaties\n"
  summary += "- Houd rekening met uw persoonlijke omstandigheden\n"
  
  return summary
}

function extractAttentionPoints(articles: KnowledgeArticle[]): string[] {
  const points: string[] = []
  
  articles.forEach(article => {
    // Extract key points from article content (vereenvoudigd)
    if (article.body.includes('belangrijk')) {
      points.push(`Let op: ${article.title}`)
    }
    if (article.body.includes('deadline')) {
      points.push(`Deadline: ${article.title}`)
    }
    if (article.body.includes('wijziging')) {
      points.push(`Wijziging: ${article.title}`)
    }
  })
  
  // Default aandachtspunten
  points.push("Controleer altijd de meest recente fiscale regels")
  points.push("Overweeg professionele begeleiding voor complexe situaties")
  
  return [...new Set(points)] // Remove duplicates
}

export async function generateCommunityAnswer(question: CommunityQuestion): Promise<CommunityAnswer[]> {
  // Zoek relevante knowledge artikelen voor de vraag
  const searchTerms = extractCommunitySearchTerms(question)
  const relevantArticles = await findRelevantArticles(question.title + " " + question.content, {})

  // Genereer antwoorden gebaseerd op de vraag categorie en relevante artikelen
  const answers: CommunityAnswer[] = []

  // Altijd minimaal 1 expert antwoord toevoegen
  answers.push(generateExpertAnswer(question, relevantArticles))

  // Soms een ervaringsantwoord toevoegen
  if (Math.random() > 0.3) {
    answers.push(generateExperienceAnswer(question))
  }

  // Soms nog een expert antwoord toevoegen voor complexere vragen
  if (relevantArticles.length > 2 && Math.random() > 0.5) {
    answers.push(generateAdditionalExpertAnswer(question, relevantArticles))
  }

  return answers
}

function extractCommunitySearchTerms(question: CommunityQuestion): string[] {
  const terms: string[] = []

  // Categorie-specifieke termen
  switch (question.category.toLowerCase()) {
    case 'bv/emz':
      terms.push('vennootschapsbelasting', 'inkomstenbelasting', 'DGA', 'gebruikelijk loon', 'zelfstandigenaftrek')
      break
    case 'beleggen':
    case 'etf':
      terms.push('box 3', 'vermogensbelasting', 'ETF', 'risicospreiding', 'beleggingsportefeuille')
      break
    case 'fiscaal':
      terms.push('belasting', 'fiscale regels', 'aftrekposten', 'bijtelling', 'forfaitaire rendement')
      break
    case 'vastgoed':
      terms.push('box 3', 'vastgoed', 'huurinkomsten', 'WOZ', 'hypotheekrenteaftrek')
      break
    case 'crypto':
      terms.push('cryptocurrency', 'digitale valuta', 'FIFO', 'staking', 'mining')
      break
  }

  // Zoek naar specifieke termen in de vraag
  const questionText = (question.title + " " + question.content).toLowerCase()

  if (questionText.includes('omzet') || questionText.includes('inkomen')) {
    terms.push('winstberekening', 'kosten')
  }

  if (questionText.includes('belasting') || questionText.includes('fiscaal')) {
    terms.push('belastingdienst', 'aangifte')
  }

  return [...new Set(terms)]
}

function generateExpertAnswer(question: CommunityQuestion, articles: KnowledgeArticle[]): CommunityAnswer {
  let content = ""

  switch (question.category.toLowerCase()) {
    case 'bv/emz':
      content = `Bij ${question.content.includes('€') ? 'deze omzet' : 'deze situatie'} is een BV zeker het overwegen waard. De belangrijkste fiscale voordelen zijn: lagere vennootschapsbelasting (19%) versus progressieve inkomstenbelasting, mogelijkheid tot salarisoptimalisatie, en betere pensioenopbouw mogelijkheden. Belangrijke aandachtspunten: DGA-regeling vereist marktconform salaris van minimaal €51.000 (2025), extra administratieve lasten, en zorg voor goede cashflow planning.`
      break

    case 'beleggen':
      content = `Voor beginnende beleggers met een conservatief profiel adviseer ik een basisallocatie van 60-70% obligaties/staatsleningen en 30-40% wereldwijde ETF's. Gebruik de '100 min leeftijd' regel als richtlijn voor de aandelen allocatie. Begin met indexfondsen zoals Vanguard FTSE All-World of iShares Core MSCI World voor brede spreiding en lage kosten.`
      break

    case 'fiscaal':
      content = `De belangrijkste fiscale wijzigingen voor 2025 zijn: zelfstandigenaftrek bedraagt €5.030, MKB-winstvrijstelling blijft 14%, gebruikelijk loon DGA minimum €51.000 (bij winst tot €200.000), en fiscale oudedagsreserve maximum bedraagt ongeveer €10.000. Ondernemers zouden hun fiscale planning hierop moeten aanpassen, vooral als ze afhankelijk zijn van de zelfstandigenaftrek.`
      break

    case 'vastgoed':
      content = `Voor Nederlandse belastingplichtigen geldt dat buitenlands vastgoed in box 3 valt en wordt belast via de nieuwe box 3 regeling (2025) met forfaitaire rendementen. Huurinkomsten worden belast tegen 49,5% inkomstenbelasting. Let op dubbele belastingverdragen - Duitsland heeft gunstige afspraken met Nederland. Zorg voor goede administratie van kosten voor aftrekposten.`
      break

    case 'crypto':
      content = `Voor crypto belasting geldt de FIFO methode (First In, First Out). Winst over verkoop binnen 1 jaar wordt belast tegen 49,5% inkomstenbelasting. Houd gedetailleerde administratie bij van: aankoopdatum, aankoopprijs, verkoopdatum, verkoopprijs, en transactiekosten. Bij professionele handel (>€30.000/jaar) geldt een aparte regeling.`
      break

    default:
      content = "Deze vraag vereist specifiek fiscaal advies. Ik raad aan om contact op te nemen met een belastingadviseur voor jouw persoonlijke situatie, aangezien fiscale regels complex zijn en afhankelijk van individuele omstandigheden."
  }

  if (articles.length > 0) {
    content += `\n\nVoor meer achtergrondinformatie, zie onze artikelen over ${articles.slice(0, 2).map(a => a.title).join(' en ')}.`
  }

  return {
    id: "expert-1",
    author: getRandomExpertName(),
    content,
    isExpert: true,
    votes: Math.floor(Math.random() * 15) + 5,
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function generateExperienceAnswer(question: CommunityQuestion): CommunityAnswer {
  let content = ""

  switch (question.category.toLowerCase()) {
    case 'bv/emz':
      content = "Ik ben zelf 2 jaar geleden overgestapt naar een BV bij vergelijkbare omzet. De fiscale voordelen zijn merkbaar, maar de administratie is inderdaad meer werk. Een goede boekhouder kost €500-800/jaar, maar dat verdient zich terug door de belastingbesparing. Zorg wel dat je cashflow goed plant - niet alles wat fiscaal voordelig is, is ook cashflow vriendelijk."
      break

    case 'beleggen':
      content = "Als beginner begon ik ook conservatief. Mijn advies: begin klein, bouw ervaring op, en gebruik een broker met lage kosten. Ik begon met €5.000 in een mix van VWRL en obligatie-ETF's. Na een jaar durfde ik meer aandelen toe te voegen. Het belangrijkste is discipline en niet in paniek verkopen bij dalende markten."
      break

    case 'vastgoed':
      content = "Ik heb zelf een huisje in Duitsland gekocht. De fiscale gevolgen vielen mee dankzij het belastingverdrag. Maar let op: je moet belastingaangifte doen in beide landen, en de Duitse autoriteiten zijn streng met administratie. Gebruik een fiscaal adviseur die ervaring heeft met grensoverschrijdend vastgoed."
      break

    case 'crypto':
      content = "Crypto belasting is inderdaad complex. Ik gebruik een spreadsheet om alles bij te houden en doe aangifte via een belastingadviseur die crypto snapt. Het scheelt veel stress en fouten. Voor beginners: bewaar ALLES - transacties, mails van exchanges, etc. De belastingdienst vraagt altijd om bewijs."
      break

    default:
      content = "Ik heb zelf een vergelijkbare situatie meegemaakt. Het belangrijkste is om niet overhaast te beslissen en professioneel advies in te winnen. Fiscale zaken zijn te belangrijk om zelf uit te vogelen."
  }

  return {
    id: "experience-1",
    author: getRandomUserName(),
    content,
    isExpert: false,
    votes: Math.floor(Math.random() * 10) + 2,
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function generateAdditionalExpertAnswer(question: CommunityQuestion, articles: KnowledgeArticle[]): CommunityAnswer {
  let content = ""

  switch (question.category.toLowerCase()) {
    case 'bv/emz':
      content = "Een belangrijk aspect dat vaak over het hoofd wordt gezien: de invloed op sociale verzekeringen. Als DGA betaal je zowel werknemers- als werkgeversdeel, wat kan oplopen tot 25-30% extra kosten. Ook belangrijk: zorg voor een goede pensioenregeling - de BV kan fiscaal vriendelijk pensioen opbouwen."
      break

    case 'beleggen':
      content = "Naast de allocatie is beleggingshorizon cruciaal. Als je langetermijn belegt (>10 jaar), kan een hoger aandelenpercentage. Maar vergeet niet: spreiding is key. Niet alles in één ETF stoppen, maar diversifiëren over regio's, sectoren en beleggingsstijlen."
      break

    case 'crypto':
      content = "Voor complexe situaties zoals mining, staking rewards, of NFT's gelden speciale regels. Mining rewards zijn belastbaar inkomen, staking rewards kunnen als inkomen of vermogen worden gezien, en NFT's worden behandeld als onroerend goed voor belastingdoeleinden. Laat dit altijd checken door een specialist."
      break

    default:
      content = "Dit is een complex fiscaal onderwerp dat professionele begeleiding vereist. De regels veranderen regelmatig en zijn afhankelijk van individuele omstandigheden. Een goede adviseur kan je helpen om compliant te blijven en optimaal voordeel te behalen."
  }

  return {
    id: "expert-2",
    author: getRandomExpertName(),
    content,
    isExpert: true,
    votes: Math.floor(Math.random() * 12) + 3,
    date: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function getRandomExpertName(): string {
  const experts = ["Fiscal Consultant", "Belasting Adviseur", "Financieel Expert", "Ondernemingsadviseur", "Tax Specialist"]
  return experts[Math.floor(Math.random() * experts.length)]
}

function getRandomUserName(): string {
  const users = ["Peter van der Berg", "Maria Jansen", "Jan Visser", "Anna Bakker", "Mark de Vries", "Lisa van Dijk"]
  return users[Math.floor(Math.random() * users.length)]
}
