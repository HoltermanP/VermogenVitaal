import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { fetchStockNews, type NewsArticle } from "@/lib/news-service"
import { fetchEnhancedStockNews, formatEnhancedNews } from "@/lib/enhanced-news-service"
import { fetchEnhancedFinancialData, formatEnhancedFinancialData } from "@/lib/enhanced-financial-data"
import { fetchSocialSentiment } from "@/lib/social-sentiment-service"

export async function POST(request: NextRequest) {
  // Parse body eerst zodat we het kunnen gebruiken in catch block
  let body: {
    symbol?: string
    currentPrice?: number
    indicators?: Record<string, unknown>
    analysis?: string
    term?: string
    score?: number
    fundamentals?: Record<string, unknown>
  } = {}
  let analysis = "AI analyse niet beschikbaar"
  
  try {
    body = await request.json()
    const {
      symbol,
      currentPrice,
      indicators,
      analysis: analysisFromBody,
      term,
      score,
      fundamentals
    } = body
    
    analysis = analysisFromBody || analysis

    if (!symbol || !indicators || !analysis) {
      return NextResponse.json(
        { error: "Symbol, indicators en analysis zijn verplicht" },
        { status: 400 }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      // Fallback naar basis analyse als AI niet beschikbaar is
      return NextResponse.json({
        analysis: analysis,
        aiEnhanced: false,
        message: "AI analyse niet beschikbaar - basis analyse wordt gebruikt"
      })
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Haal uitgebreide data op (parallel voor snelheid)
    let newsData = {
      companyNews: [] as NewsArticle[],
      sectorNews: [] as NewsArticle[],
      marketNews: [] as NewsArticle[],
      analystNews: [] as NewsArticle[]
    }
    let enhancedFinancialData = null
    let socialSentiment = null
    
    try {
      // Haal enhanced news op (met analyst nieuws)
      try {
        const enhancedNews = await fetchEnhancedStockNews(
          symbol,
          fundamentals?.companyName as string | undefined,
          fundamentals?.sector as string | undefined,
          fundamentals?.industry as string | undefined,
          20 // Meer artikelen voor betere analyse
        )
        newsData = enhancedNews
        console.log(`[StockAnalysis] Enhanced nieuws opgehaald: ${newsData.companyNews.length} bedrijf, ${newsData.sectorNews.length} sector, ${newsData.marketNews.length} markt, ${newsData.analystNews.length} analyst`)
      } catch (enhancedNewsError) {
        console.warn("[StockAnalysis] Enhanced news faalt, fallback naar basis news:", enhancedNewsError)
        // Fallback naar basis news
        const basicNews = await fetchStockNews(
          symbol,
          fundamentals?.companyName as string | undefined,
          fundamentals?.sector as string | undefined,
          fundamentals?.industry as string | undefined,
          15
        )
        newsData = {
          ...basicNews,
          analystNews: [] // Voeg lege analystNews array toe voor type compatibiliteit
        }
      }

      // Haal enhanced financial data op (parallel)
      try {
        enhancedFinancialData = await fetchEnhancedFinancialData(
          symbol,
          fundamentals?.companyName as string | undefined
        )
        console.log(`[StockAnalysis] Enhanced financial data opgehaald voor ${symbol}`)
      } catch (financialError) {
        console.warn("[StockAnalysis] Enhanced financial data niet beschikbaar:", financialError)
        // Doorgaan zonder enhanced financial data
      }

      // Haal social sentiment op (optioneel, niet kritiek)
      try {
        socialSentiment = await fetchSocialSentiment(
          symbol,
          fundamentals?.companyName as string | undefined,
          20
        )
        console.log(`[StockAnalysis] Social sentiment opgehaald: ${socialSentiment?.topPosts.length || 0} Reddit posts`)
      } catch (sentimentError) {
        console.warn("[StockAnalysis] Social sentiment niet beschikbaar:", sentimentError)
        // Doorgaan zonder social sentiment
      }
    } catch (dataError) {
      console.warn("[StockAnalysis] Fout bij ophalen enhanced data, doorgaan met basis data:", dataError)
      // Doorgaan met basis data
    }

    // Bouw een uitgebreide prompt met alle technische indicatoren en fundamentele data
    const fundamentalsText = fundamentals ? `
BEDRIJFSRESULTATEN EN KENTALLEN:
Bedrijfsnaam: ${fundamentals.companyName || 'N/A'}
Sector: ${fundamentals.sector || 'N/A'}
Industrie: ${fundamentals.industry || 'N/A'}

VALUATIE KENTALLEN:
- Marktkapitalisatie: ${fundamentals.marketCap ? `$${((fundamentals.marketCap as number) / 1e9).toFixed(2)}B` : 'N/A'}
- P/E Ratio (Trailing): ${fundamentals.trailingPE ? ((fundamentals.trailingPE as number).toFixed(2)) : 'N/A'}
- P/E Ratio (Forward): ${fundamentals.forwardPE ? ((fundamentals.forwardPE as number).toFixed(2)) : 'N/A'}
- PEG Ratio: ${fundamentals.pegRatio ? ((fundamentals.pegRatio as number).toFixed(2)) : 'N/A'}
- Price to Book: ${fundamentals.priceToBook ? ((fundamentals.priceToBook as number).toFixed(2)) : 'N/A'}
- Price to Sales: ${fundamentals.priceToSales ? ((fundamentals.priceToSales as number).toFixed(2)) : 'N/A'}
- Enterprise Value/Revenue: ${fundamentals.enterpriseToRevenue ? ((fundamentals.enterpriseToRevenue as number).toFixed(2)) : 'N/A'}
- Enterprise Value/EBITDA: ${fundamentals.enterpriseToEbitda ? ((fundamentals.enterpriseToEbitda as number).toFixed(2)) : 'N/A'}

WINSTGEVENDHEID:
- Winstmarge: ${fundamentals.profitMargins ? (((fundamentals.profitMargins as number) * 100).toFixed(2) + '%') : 'N/A'}
- Operationele Marge: ${fundamentals.operatingMargins ? (((fundamentals.operatingMargins as number) * 100).toFixed(2) + '%') : 'N/A'}
- EBITDA Marge: ${fundamentals.ebitdaMargins ? (((fundamentals.ebitdaMargins as number) * 100).toFixed(2) + '%') : 'N/A'}
- Return on Assets (ROA): ${fundamentals.returnOnAssets ? (((fundamentals.returnOnAssets as number) * 100).toFixed(2) + '%') : 'N/A'}
- Return on Equity (ROE): ${fundamentals.returnOnEquity ? (((fundamentals.returnOnEquity as number) * 100).toFixed(2) + '%') : 'N/A'}

FINANCIËLE GEZONDHEID:
- Debt to Equity: ${fundamentals.debtToEquity ? ((fundamentals.debtToEquity as number).toFixed(2)) : 'N/A'}
- Current Ratio: ${fundamentals.currentRatio ? ((fundamentals.currentRatio as number).toFixed(2)) : 'N/A'}
- Quick Ratio: ${fundamentals.quickRatio ? ((fundamentals.quickRatio as number).toFixed(2)) : 'N/A'}
- Beta: ${fundamentals.beta ? ((fundamentals.beta as number).toFixed(2)) : 'N/A'}

RESULTATEN:
- Earnings per Share (EPS): $${fundamentals.earningsPerShare ? ((fundamentals.earningsPerShare as number).toFixed(2)) : 'N/A'}
- Forward EPS: $${fundamentals.forwardEps ? ((fundamentals.forwardEps as number).toFixed(2)) : 'N/A'}
- Revenue per Share: $${fundamentals.revenuePerShare ? ((fundamentals.revenuePerShare as number).toFixed(2)) : 'N/A'}
- Book Value: $${fundamentals.bookValue ? ((fundamentals.bookValue as number).toFixed(2)) : 'N/A'}

GROEI:
- Revenue Groei: ${fundamentals.revenueGrowth ? (((fundamentals.revenueGrowth as number) * 100).toFixed(2) + '%') : 'N/A'}
- Earnings Groei: ${fundamentals.earningsGrowth ? (((fundamentals.earningsGrowth as number) * 100).toFixed(2) + '%') : 'N/A'}

CASHFLOW:
- Free Cashflow: ${fundamentals.freeCashflow ? `$${((fundamentals.freeCashflow as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Operating Cashflow: ${fundamentals.operatingCashflow ? `$${((fundamentals.operatingCashflow as number) / 1e6).toFixed(2)}M` : 'N/A'}

DIVIDEND:
- Dividend Yield: ${fundamentals.dividendYield ? (((fundamentals.dividendYield as number) * 100).toFixed(2) + '%') : 'N/A'}
- Payout Ratio: ${fundamentals.payoutRatio ? (((fundamentals.payoutRatio as number) * 100).toFixed(2) + '%') : 'N/A'}

ANALYST VERWACHTINGEN:
- Target Mean Price: $${fundamentals.targetMeanPrice ? ((fundamentals.targetMeanPrice as number).toFixed(2)) : 'N/A'}
- Target High: $${fundamentals.targetHighPrice ? ((fundamentals.targetHighPrice as number).toFixed(2)) : 'N/A'}
- Target Low: $${fundamentals.targetLowPrice ? ((fundamentals.targetLowPrice as number).toFixed(2)) : 'N/A'}
- Aantal Analisten: ${fundamentals.numberOfAnalystOpinions || 'N/A'}
- Aanbeveling: ${fundamentals.recommendationKey || 'N/A'}

INCOME STATEMENT (Laatste 4 jaar):
${(fundamentals.incomeStatement as Array<Record<string, unknown>> | undefined)?.map((item: Record<string, unknown>) => `
Jaar ${item.year}:
- Totale Omzet: ${item.totalRevenue ? `$${((item.totalRevenue as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Bruto Winst: ${item.grossProfit ? `$${((item.grossProfit as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Operationeel Inkomen: ${item.operatingIncome ? `$${((item.operatingIncome as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Netto Inkomen: ${item.netIncome ? `$${((item.netIncome as number) / 1e6).toFixed(2)}M` : 'N/A'}
- EBITDA: ${item.ebitda ? `$${((item.ebitda as number) / 1e6).toFixed(2)}M` : 'N/A'}
`).join('') || 'Geen data beschikbaar'}

BALANCE SHEET (Laatste 4 jaar):
${(fundamentals.balanceSheet as Array<Record<string, unknown>> | undefined)?.map((item: Record<string, unknown>) => `
Jaar ${item.year}:
- Totale Activa: ${item.totalAssets ? `$${((item.totalAssets as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Totale Passiva: ${item.totalLiab ? `$${((item.totalLiab as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Eigen Vermogen: ${item.totalStockholderEquity ? `$${((item.totalStockholderEquity as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Cash: ${item.cash ? `$${((item.cash as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Langlopende Schuld: ${item.longTermDebt ? `$${((item.longTermDebt as number) / 1e6).toFixed(2)}M` : 'N/A'}
`).join('') || 'Geen data beschikbaar'}

CASHFLOW STATEMENT (Laatste 4 jaar):
${(fundamentals.cashFlow as Array<Record<string, unknown>> | undefined)?.map((item: Record<string, unknown>) => `
Jaar ${item.year}:
- Operating Cashflow: ${item.totalCashFromOperatingActivities ? `$${((item.totalCashFromOperatingActivities as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Free Cashflow: ${item.freeCashFlow ? `$${((item.freeCashFlow as number) / 1e6).toFixed(2)}M` : 'N/A'}
- Capital Expenditures: ${item.capitalExpenditures ? `$${(Math.abs(item.capitalExpenditures as number) / 1e6).toFixed(2)}M` : 'N/A'}
`).join('') || 'Geen data beschikbaar'}
` : 'Geen fundamentele data beschikbaar'

    // Format nieuws - gebruik enhanced news formatting als beschikbaar
    let newsText = ''
    if (newsData.analystNews && newsData.analystNews.length > 0) {
      // Gebruik enhanced news formatting
      newsText = formatEnhancedNews(newsData as {
        companyNews: NewsArticle[]
        sectorNews: NewsArticle[]
        marketNews: NewsArticle[]
        analystNews: NewsArticle[]
      })
    } else {
      // Fallback naar basis formatting
      const formatNews = (articles: NewsArticle[], category: string) => {
        if (!articles || articles.length === 0) {
          return `Geen ${category} nieuws beschikbaar`
        }
        return articles.slice(0, 15).map((article, idx) => 
          `${idx + 1}. ${article.title}${article.description ? ` - ${article.description}` : ''} (${article.source}, ${new Date(article.publishedAt).toLocaleDateString('nl-NL')})`
        ).join('\n')
      }

      newsText = `
RECENT NIEUWS EN MARKTONTWIKKELINGEN:

BEDRIJFSNIEUWS (${newsData.companyNews.length} artikelen):
${formatNews(newsData.companyNews, 'bedrijfs')}

SECTORNIEUWS (${newsData.sectorNews.length} artikelen):
${formatNews(newsData.sectorNews, 'sector')}

ALGEMENE MARKTONTWIKKELINGEN (${newsData.marketNews.length} artikelen):
${formatNews(newsData.marketNews, 'markt')}
`
    }

    // Voeg enhanced financial data toe als beschikbaar
    let enhancedFinancialText = ''
    if (enhancedFinancialData) {
      enhancedFinancialText = formatEnhancedFinancialData(enhancedFinancialData)
    }

    // Voeg social sentiment toe als beschikbaar
    let socialSentimentText = ''
    if (socialSentiment && socialSentiment.topPosts.length > 0) {
      const positivePct = socialSentiment.totalPosts > 0 
        ? Math.round((socialSentiment.positivePosts / socialSentiment.totalPosts) * 100) 
        : 0
      const neutralPct = socialSentiment.totalPosts > 0 
        ? Math.round((socialSentiment.neutralPosts / socialSentiment.totalPosts) * 100) 
        : 0
      const negativePct = socialSentiment.totalPosts > 0 
        ? Math.round((socialSentiment.negativePosts / socialSentiment.totalPosts) * 100) 
        : 0

      socialSentimentText = `
SOCIAL SENTIMENT (Reddit):
${socialSentiment.topPosts.slice(0, 10).map((post, idx: number) => 
  `${idx + 1}. ${post.title} (${post.score} upvotes, ${post.comments} comments) - r/${post.subreddit}\n   ${post.content.substring(0, 200) || ''}`
).join('\n\n')}

Sentiment Analyse:
- Overall Sentiment: ${socialSentiment.overallSentiment}
- Sentiment Score: ${socialSentiment.sentimentScore.toFixed(2)} (-1 tot 1)
- Positief: ${positivePct}% (${socialSentiment.positivePosts} posts)
- Neutraal: ${neutralPct}% (${socialSentiment.neutralPosts} posts)
- Negatief: ${negativePct}% (${socialSentiment.negativePosts} posts)
- Totaal posts: ${socialSentiment.totalPosts}
`
    }

    // Bepaal termijn-specifieke focus gebaseerd op de termijn
    const getTermFocus = (termStr: string) => {
      const termLower = termStr.toLowerCase()
      if (termLower.includes('zeer kort') || termLower.includes('very short')) {
        return {
          timeframe: "1-7 dagen",
          focus: "Korte termijn technische indicatoren (RSI, MACD, momentum, volume), intraday patronen, sentiment, en recent nieuws dat directe impact kan hebben. Fundamentele factoren zijn minder relevant op deze termijn.",
          keyFactors: ["Technische momentum", "Volume patronen", "RSI overbought/oversold", "MACD signalen", "Recente nieuws impact", "Support/resistance niveaus", "Korte termijn sentiment"]
        }
      } else if (termLower.includes('kort') && !termLower.includes('zeer')) {
        return {
          timeframe: "1-4 weken",
          focus: "Technische trends, momentum, volume analyse, en recente bedrijfsontwikkelingen. Fundamentele kentallen beginnen relevant te worden, vooral earnings verwachtingen en analyst upgrades/downgrades.",
          keyFactors: ["Technische trends", "Volume analyse", "Momentum indicatoren", "Recente earnings/nieuws", "Analyst verwachtingen", "Sector momentum", "Korte termijn support/resistance"]
        }
      } else if (termLower.includes('midden') || termLower.includes('medium')) {
        return {
          timeframe: "1-6 maanden",
          focus: "Balans tussen technische en fundamentele analyse. Quarterly earnings, revenue trends, sector ontwikkelingen, en technische trendbevestiging zijn cruciaal.",
          keyFactors: ["Quarterly earnings trends", "Revenue groei", "Sector performance", "Technische trendbevestiging", "Analyst consensus", "Bedrijfsfundamentals", "Marktomstandigheden"]
        }
      } else if (termLower.includes('lang') && !termLower.includes('zeer')) {
        return {
          timeframe: "6 maanden - 2 jaar",
          focus: "Fundamentele analyse wordt primair. Jaarlijkse earnings trends, bedrijfsstrategie, concurrentiepositie, en sector trends zijn belangrijk. Technische analyse ondersteunt entry/exit timing.",
          keyFactors: ["Jaarlijkse earnings trends", "Bedrijfsstrategie", "Concurrentiepositie", "Sector trends", "Valuatie (P/E, PEG)", "ROE/ROA trends", "Debt positie", "Management kwaliteit"]
        }
      } else if (termLower.includes('zeer lang') || termLower.includes('very long')) {
        return {
          timeframe: "2-5+ jaar",
          focus: "Fundamentele analyse is volledig dominant. Bedrijfsmodel, duurzame concurrentievoordelen, marktpositie, innovatie, en lange termijn groeipotentieel. Technische analyse is minimaal relevant.",
          keyFactors: ["Bedrijfsmodel duurzaamheid", "Concurrentievoordelen", "Marktleiderspositie", "Innovatie capaciteit", "Lange termijn groeipotentieel", "Sector disruptie risico's", "Management visie", "ESG factoren"]
        }
      }
      return {
        timeframe: "Algemeen",
        focus: "Balans tussen technische en fundamentele analyse met focus op alle beschikbare data.",
        keyFactors: ["Technische indicatoren", "Fundamentele kentallen", "Nieuws en ontwikkelingen", "Sector trends", "Marktomstandigheden"]
      }
    }

    const termFocus = getTermFocus(term || '')

    const prompt = `Je bent een top-tier technisch EN fundamenteel analist met jarenlange ervaring in professionele aandelenanalyse. Je analyseert dit aandeel voor de specifieke termijn "${term}" met diepgaande, gedetailleerde inzichten. Je doet uitgebreid onderzoek en analyseert ALLE beschikbare data grondig.

AANDEEL: ${symbol}
HUIDIGE PRIJS: $${currentPrice?.toFixed(2) || 'N/A'}
TERMIJN: ${term || 'Algemeen'} (${termFocus.timeframe})
HUIDIGE SCORE: ${score?.toFixed(1) || 'N/A'}/10

TERMIJN-SPECIFIEKE FOCUS:
Voor deze termijn (${termFocus.timeframe}) moet je je richten op: ${termFocus.focus}

Belangrijkste factoren voor deze termijn:
${termFocus.keyFactors.map(f => `- ${f}`).join('\n')}

TECHNISCHE INDICATOREN:
${JSON.stringify(indicators, null, 2)}

${fundamentalsText}

${enhancedFinancialText ? `\n${enhancedFinancialText}\n` : ''}

${newsText}

${socialSentimentText ? `\n${socialSentimentText}\n` : ''}

BESTAANDE BASIS ANALYSE:
${analysis}

KRITIEKE ANALYSE-OPDRACHT - DIEPGAAND ONDERZOEK:

1. TERMIJN-SPECIFIEKE ANALYSE (VERPLICHT DIEPGAAND):
   - Analyseer ALLE beschikbare data grondig met focus op factoren die relevant zijn voor de ${termFocus.timeframe} termijn
   - Voor korte termijn: focus op technische momentum, volume patronen, recent nieuws, en sentiment
   - Voor lange termijn: focus op fundamentele gezondheid, bedrijfsmodel duurzaamheid, concurrentiepositie, en duurzame groei
   - Leg expliciet uit WAAROM bepaalde factoren meer/minder relevant zijn voor deze specifieke termijn
   - Geef concrete voorbeelden en cijfers uit de beschikbare data

2. DIEPGAANDE DATA-ANALYSE (VERPLICHT UITGEBREID):
   - Analyseer technische indicatoren in detail: wat betekenen ze in de context van deze termijn? Hoe verhouden ze zich tot historische waarden?
   - Analyseer fundamentele kentallen grondig: zijn ze gezond voor deze termijn? Vergelijk met sector gemiddelden EN peers (als beschikbaar)
   - Analyseer financiële trends diepgaand: income statements, balance sheets, cashflow over meerdere jaren
     * Identificeer trends: zijn revenue, earnings, en cashflow stijgend of dalend?
     * Analyseer marges: zijn winstmarges verbeterend of verslechterend?
     * Beoordeel financiële gezondheid: schuldpositie, liquiditeit, solvabiliteit
   - Identificeer patronen, trends, en anomalieën in de data - leg uit wat ze betekenen
   - Beoordeel of de huidige koers redelijk is gezien de fundamentele waarde EN technische setup
   - **BELANGRIJK: Als er technische patronen (Patterns) in de indicators staan:**
     * Analyseer elk gedetecteerd patroon in detail met volledige uitleg
     * Leg uit wat elk patroon betekent en wat de historische betrouwbaarheid is
     * Bespreek de betrouwbaarheid (confidence) van elk patroon en waarom
     * Verwijs naar entry, target en stop levels waar beschikbaar
     * Leg uit hoe de patronen de verwachte koersrichting beïnvloeden voor deze termijn
     * Integreer de patronen volledig in je technische analyse en verwachtingen
   - **Als enhanced financial data beschikbaar is:**
     * Vergelijk key metrics met peers (als beschikbaar)
     * Analyseer analyst estimates en verwachtingen
     * Beoordeel recente SEC filings (als beschikbaar) en hun impact
     * Gebruik alle extra data om een completer beeld te krijgen

3. NIEUWS EN SENTIMENT INTEGRATIE (VERPLICHT GRONDIG):
   - Bedrijfsnieuws: Analyseer elk relevant nieuwsitem in detail. Welke ontwikkelingen zijn relevant voor deze termijn? 
     * Onderscheid korte termijn nieuws (directe impact) vs. lange termijn impact
     * Beoordeel de geloofwaardigheid en impact van elk nieuwsitem
   - Analyst nieuws: Als analyst nieuws beschikbaar is, analyseer dit grondig:
     * Wat zeggen analisten over dit aandeel?
     * Zijn er recente upgrades/downgrades?
     * Wat zijn de consensus verwachtingen?
   - Sectornieuws: Hoe beïnvloeden sector trends dit aandeel op deze termijn?
     * Is de sector in opkomst of neergang?
     * Hoe presteert dit bedrijf ten opzichte van sector gemiddelden?
   - Marktontwikkelingen: Macro-economische factoren die relevant zijn voor deze termijn
     * Hoe beïnvloeden macro trends (rente, inflatie, economische groei) dit aandeel?
   - Social sentiment: Als social sentiment data beschikbaar is:
     * Analyseer Reddit discussies en sentiment
     * Is er retail investor interesse? Is dit positief of negatief?
     * Hoe verhoudt sentiment zich tot fundamentele waarde?
   - Beoordeel de impact van elk nieuwsitem en sentiment op de verwachte prestaties voor deze termijn

4. RISICO-ANALYSE (VERPLICHT UITGEBREID):
   - Identificeer specifieke risico's voor deze termijn met concrete voorbeelden
   - Korte termijn: technische risico's (support breaks, overbought/oversold), sentiment risico's, earnings risico's
   - Lange termijn: bedrijfsmodel risico's, concurrentie risico's, sector disruptie, technologische veranderingen
   - Kwantificeer waar mogelijk de risico's (bijv. "20% kans op support break bij $X")
   - Beoordeel of risico's acceptabel zijn voor deze termijn
   - Geef aan hoe risico's kunnen worden gemitigeerd

5. CONCRETE VERWACHTINGEN EN SCENARIO'S (VERPLICHT SPECIFIEK):
   - Geef specifieke, onderbouwde verwachtingen voor de ${termFocus.timeframe} termijn
   - Gebruik technische doelen (support/resistance) waar relevant - geef concrete prijsniveaus
   - Gebruik fundamentele waardering (fair value) waar relevant - geef een range
   - Combineer beide voor een compleet beeld met verschillende scenario's
   - Geef waarschijnlijkheidsschattingen voor verschillende scenario's:
     * Bull case (optimistisch): X% kans, prijsdoel $Y, redenen: ...
     * Base case (waarschijnlijk): X% kans, prijsdoel $Y, redenen: ...
     * Bear case (pessimistisch): X% kans, prijsdoel $Y, redenen: ...
   - Leg uit welke factoren elk scenario zouden triggeren

6. SCORE EVALUATIE EN TOELICHTING:
   De huidige score is ${score?.toFixed(1) || 'N/A'}/10. Je moet:
   - Evalueer of deze score ACCURAAT is op basis van alle beschikbare data
   - Als de score te hoog/laag lijkt, leg uit waarom en wat een meer accurate score zou zijn
   - Geef een GEDETAILLEERDE toelichting die minimaal 200 woorden bevat
   - Benoem minimaal 3-5 specifieke POSITIEVE factoren die de score ondersteunen
   - Benoem minimaal 3-5 specifieke NEGATIEVE factoren of risico's die de score beperken
   - Weeg de factoren af: welke zijn het belangrijkst voor deze termijn?
   - Geef context: hoe verhoudt deze score zich tot sector gemiddelden?
   - Leg uit hoe verschillende termijnen verschillende scores zouden rechtvaardigen

STIJL EN KWALITEIT (KRITIEK):
- Professioneel, diepgaand, en zeer gedetailleerd - dit is een professionele analyse, niet oppervlakkig
- Gebruik ALTIJD concrete cijfers, percentages, en data uit de beschikbare informatie - geen vage uitspraken
- Verwijs naar specifieke indicatoren, kentallen, jaren, kwartalen, en nieuwsartikelen met exacte waarden
- Wees eerlijk en objectief over onzekerheden en risico's - geen overdreven optimisme of pessimisme
- Geef praktische, actiegerichte inzichten met concrete aanbevelingen
- Structureer duidelijk met kopjes en paragrafen
- Minimum 1200-1800 woorden voor de analyse sectie (dit is een diepgaande analyse, niet oppervlakkig)
- Minimum 300 woorden voor de score toelichting (uitgebreide onderbouwing)
- Analyseer ALLE beschikbare data - laat geen belangrijke informatie onbesproken
- Geef context: vergelijk waar mogelijk met historische waarden, sector gemiddelden, en peers
- Wees specifiek: gebruik exacte cijfers, percentages, en datums in plaats van vage termen

FORMAT (STRICT):
Je antwoord MOET exact deze structuur volgen:

## UITGEBREIDE ANALYSE

### 1. TERMIJN-SPECIFIEKE CONTEXT
[Leg uit waarom deze termijn specifieke aandachtspunten heeft en welke factoren het meest relevant zijn]

### 2. TECHNISCHE ANALYSE
[Diepgaande analyse van alle technische indicatoren, patronen, trends, en wat ze betekenen voor deze termijn]

**Als er technische patronen gedetecteerd zijn:**
- Bespreek elk patroon in detail met uitleg van wat het betekent
- Leg uit wat de implicaties zijn voor deze specifieke termijn
- Verwijs naar de betrouwbaarheid, entry/target/stop levels
- Integreer de patronen in je technische verwachtingen

### 3. FUNDAMENTELE ANALYSE
[Uitgebreide analyse van bedrijfsresultaten, kentallen, financiële gezondheid, trends, en wat ze betekenen voor deze termijn]

### 4. NIEUWS EN MARKTONTWIKKELINGEN
[Analyse van relevant nieuws en marktontwikkelingen, en hun impact op deze termijn]

### 5. RISICO-ANALYSE
[Specifieke risico's voor deze termijn met kwantificering waar mogelijk]

### 6. VERWACHTINGEN EN SCENARIO'S
[Concrete verwachtingen voor deze termijn met waarschijnlijkheidsschattingen]

---

## SCORE TOELICHTING

### HUIDIGE SCORE: ${score?.toFixed(1) || 'N/A'}/10

### SCORE EVALUATIE
[Evalueer of de score accuraat is en leg uit waarom]

### POSITIEVE FACTOREN (${termFocus.timeframe})
[Minimaal 3-5 specifieke positieve factoren met uitleg waarom ze belangrijk zijn voor deze termijn]

### NEGATIEVE FACTOREN EN RISICO'S (${termFocus.timeframe})
[Minimaal 3-5 specifieke negatieve factoren/risico's met uitleg van hun impact op deze termijn]

### FACTOREN-WEGING
[Leg uit welke factoren het belangrijkst zijn voor deze termijn en waarom]

### SECTOR VERGELIJKING
[Hoe verhoudt deze score zich tot sector gemiddelden?]

### CONCLUSIE
[Samenvatting van waarom dit aandeel deze score krijgt voor deze specifieke termijn]

---

Geef een uitgebreide, professionele analyse die alle beschikbare data integreert en specifiek is voor de ${term} termijn.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Je bent een top-tier technisch EN fundamenteel analist met jarenlange ervaring in professionele aandelenanalyse. Je hebt diepgaande kennis van technische analyse, fundamentele analyse, bedrijfsfinanciën, marktpsychologie, koerspatronen, sectoranalyse, en marktnieuws. Je integreert altijd alle beschikbare data (technische indicatoren, bedrijfsresultaten, kentallen, financiële statements, en recent nieuws) in je analyses. Je geeft altijd zeer gedetailleerde, accurate, professionele analyses in het Nederlands die specifiek zijn voor de gevraagde termijn. Je analyseert altijd grondig en geeft concrete, onderbouwde inzichten."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5, // Lager voor meer consistente, gefocuste, diepgaande analyses
      max_tokens: 6000 // Verhoogd voor uitgebreide, diepgaande analyses met meer detail
    })

    const aiResponse = response.choices[0]?.message?.content || analysis
    
    // Parse de response om analyse en score toelichting te scheiden
    let aiAnalysis = aiResponse
    let scoreExplanation = ""
    
    // Zoek naar "## SCORE TOELICHTING" of "SCORE TOELICHTING" sectie (met verschillende varianten)
    const scoreSectionPatterns = [
      /##\s*SCORE\s+TOELICHTING/i,
      /#\s*SCORE\s+TOELICHTING/i,
      /SCORE\s+TOELICHTING/i,
      /---\s*\n\s*##\s*SCORE/i,
      /---\s*\n\s*#\s*SCORE/i
    ]
    
    let scoreSectionIndex = -1
    for (const pattern of scoreSectionPatterns) {
      const match = aiResponse.match(pattern)
      if (match && match.index !== undefined) {
        scoreSectionIndex = match.index
        break
      }
    }
    
    if (scoreSectionIndex > -1) {
      // Splits op de score sectie
      aiAnalysis = aiResponse.substring(0, scoreSectionIndex).trim()
      scoreExplanation = aiResponse.substring(scoreSectionIndex)
        .replace(/##?\s*SCORE\s+TOELICHTING:?\s*/i, "")
        .replace(/---\s*/g, "")
        .trim()
      
      // Verwijder eventuele lege regels aan het begin
      scoreExplanation = scoreExplanation.replace(/^\n+/, "").trim()
    } else {
      // Als er geen expliciete sectie is, probeer de laatste paragraaf als toelichting te gebruiken
      const sections = aiResponse.split(/\n---\n|\n##\s+/)
      if (sections.length > 1) {
        const lastSection = sections[sections.length - 1]
        if (lastSection.toLowerCase().includes('score') || 
            lastSection.toLowerCase().includes('toelichting') ||
            lastSection.toLowerCase().includes('beoordeling')) {
          scoreExplanation = lastSection.trim()
          aiAnalysis = sections.slice(0, -1).join('\n\n').trim()
        }
      }
    }
    
    // Als er nog steeds geen score toelichting is, maar de analyse bevat score informatie, 
    // probeer het laatste deel te extraheren
    if (!scoreExplanation && aiResponse.toLowerCase().includes('score')) {
      const scoreMatch = aiResponse.match(/(?:score|beoordeling)[\s\S]*$/i)
      if (scoreMatch && scoreMatch.index !== undefined) {
        scoreExplanation = scoreMatch[0].trim()
        aiAnalysis = aiResponse.substring(0, scoreMatch.index).trim()
      }
    }

    return NextResponse.json({
      analysis: aiAnalysis,
      scoreExplanation: scoreExplanation || undefined,
      aiEnhanced: true
    })
  } catch (error) {
    console.error("Error in AI stock analysis:", error)
    
    // Fallback naar basis analyse bij fout
    const fallbackAnalysis = body.analysis || analysis || "AI analyse niet beschikbaar"
    
    return NextResponse.json({
      analysis: fallbackAnalysis,
      aiEnhanced: false,
      error: error instanceof Error ? error.message : "Onbekende fout"
    })
  }
}

