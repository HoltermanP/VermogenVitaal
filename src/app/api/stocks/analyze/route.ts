import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { fetchStockNews, type NewsArticle } from "@/lib/news-service"

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

    // Haal nieuws op voor het aandeel (bedrijf, sector, markt)
    let newsData = {
      companyNews: [] as NewsArticle[],
      sectorNews: [] as NewsArticle[],
      marketNews: [] as NewsArticle[]
    }
    
    try {
      newsData = await fetchStockNews(
        symbol,
        fundamentals?.companyName as string | undefined,
        fundamentals?.sector as string | undefined,
        fundamentals?.industry as string | undefined,
        10 // Limiet per categorie
      )
      console.log(`[StockAnalysis] Nieuws opgehaald: ${newsData.companyNews.length} bedrijf, ${newsData.sectorNews.length} sector, ${newsData.marketNews.length} markt`)
    } catch (newsError) {
      console.warn("[StockAnalysis] Fout bij ophalen nieuws, doorgaan zonder nieuws:", newsError)
      // Doorgaan zonder nieuws als het ophalen faalt
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

    // Format nieuws voor prompt
    const formatNews = (articles: NewsArticle[], category: string) => {
      if (!articles || articles.length === 0) {
        return `Geen ${category} nieuws beschikbaar`
      }
      return articles.slice(0, 10).map((article, idx) => 
        `${idx + 1}. ${article.title}${article.description ? ` - ${article.description}` : ''} (${article.source}, ${new Date(article.publishedAt).toLocaleDateString('nl-NL')})`
      ).join('\n')
    }

    const newsText = `
RECENT NIEUWS EN MARKTONTWIKKELINGEN:

BEDRIJFSNIEUWS (${newsData.companyNews.length} artikelen):
${formatNews(newsData.companyNews, 'bedrijfs')}

SECTORNIEUWS (${newsData.sectorNews.length} artikelen):
${formatNews(newsData.sectorNews, 'sector')}

ALGEMENE MARKTONTWIKKELINGEN (${newsData.marketNews.length} artikelen):
${formatNews(newsData.marketNews, 'markt')}
`

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

    const prompt = `Je bent een top-tier technisch EN fundamenteel analist met jarenlange ervaring in professionele aandelenanalyse. Je analyseert dit aandeel voor de specifieke termijn "${term}" met diepgaande, gedetailleerde inzichten.

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

${newsText}

BESTAANDE BASIS ANALYSE:
${analysis}

KRITIEKE ANALYSE-OPDRACHT:

1. TERMIJN-SPECIFIEKE ANALYSE:
   - Analyseer ALLE data met focus op factoren die relevant zijn voor de ${termFocus.timeframe} termijn
   - Voor korte termijn: focus op technische momentum, volume, en recent nieuws
   - Voor lange termijn: focus op fundamentele gezondheid, bedrijfsmodel, en duurzame groei
   - Leg expliciet uit WAAROM bepaalde factoren meer/minder relevant zijn voor deze specifieke termijn

2. DIEPGAANDE DATA-ANALYSE:
   - Analyseer technische indicatoren: wat betekenen ze in de context van deze termijn?
   - Analyseer fundamentele kentallen: zijn ze gezond voor deze termijn? Vergelijk met sector gemiddelden
   - Analyseer financiële trends: income statements, balance sheets, cashflow over meerdere jaren
   - Identificeer patronen, trends, en anomalieën in de data
   - Beoordeel of de huidige koers redelijk is gezien de fundamentele waarde EN technische setup
   - **BELANGRIJK: Als er technische patronen (Patterns) in de indicators staan:**
     * Analyseer elk gedetecteerd patroon in detail
     * Leg uit wat elk patroon betekent en wat de implicaties zijn voor deze termijn
     * Bespreek de betrouwbaarheid (confidence) van elk patroon
     * Verwijs naar entry, target en stop levels waar beschikbaar
     * Leg uit hoe de patronen de verwachte koersrichting beïnvloeden
     * Integreer de patronen in je technische analyse en verwachtingen

3. NIEUWS INTEGRATIE:
   - Bedrijfsnieuws: Welke ontwikkelingen zijn relevant voor deze termijn? Korte termijn nieuws vs. lange termijn impact
   - Sectornieuws: Hoe beïnvloeden sector trends dit aandeel op deze termijn?
   - Marktontwikkelingen: Macro-economische factoren die relevant zijn voor deze termijn
   - Beoordeel de impact van elk nieuwsitem op de verwachte prestaties voor deze termijn

4. RISICO-ANALYSE:
   - Identificeer specifieke risico's voor deze termijn
   - Korte termijn: technische risico's, sentiment risico's, earnings risico's
   - Lange termijn: bedrijfsmodel risico's, concurrentie risico's, sector disruptie
   - Kwantificeer waar mogelijk de risico's

5. CONCRETE VERWACHTINGEN:
   - Geef specifieke, onderbouwde verwachtingen voor de ${termFocus.timeframe} termijn
   - Gebruik technische doelen (support/resistance) waar relevant
   - Gebruik fundamentele waardering (fair value) waar relevant
   - Combineer beide voor een compleet beeld
   - Geef een waarschijnlijkheidsschatting voor verschillende scenario's

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

STIJL EN KWALITEIT:
- Professioneel, diepgaand, en zeer gedetailleerd
- Gebruik concrete cijfers, percentages, en data uit de beschikbare informatie
- Verwijs naar specifieke indicatoren, kentallen, jaren, kwartalen, en nieuwsartikelen
- Wees eerlijk en objectief over onzekerheden en risico's
- Geef praktische, actiegerichte inzichten
- Structureer duidelijk met kopjes en paragrafen
- Minimum 800-1200 woorden voor de analyse sectie
- Minimum 200 woorden voor de score toelichting

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
      temperature: 0.6, // Iets lager voor meer consistente, gefocuste analyses
      max_tokens: 4000 // Verhoogd voor uitgebreide, diepgaande analyses
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

