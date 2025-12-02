import { Document, Page, Text, View, StyleSheet, Svg, Line, Path, Rect, Circle, G, Defs, LinearGradient, Stop, Tspan } from '@react-pdf/renderer'
import React from 'react'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: '#374151',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: '#6b7280',
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
  disclaimer: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f3f4f6',
  },
  chartTable: {
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
  },
  chartTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 5,
  },
  chartTableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  chartTableCell: {
    flex: 1,
    fontSize: 9,
    paddingHorizontal: 5,
    color: '#374151',
  },
  chartTableHeaderCell: {
    flex: 1,
    fontSize: 10,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#1f2937',
  },
  chartContainer: {
    marginTop: 10,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  chartSvg: {
    marginTop: 10,
  },
  chartLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 5,
  },
})

interface PdfReportProps {
  title: string
  scenario: Record<string, string | number | boolean>
  results: Record<string, string | number | boolean>
  generatedAt: Date
}

export function createPdfReport({ title, scenario, results, generatedAt }: PdfReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{title}</Text>
        
        <View style={styles.section}>
          <Text style={styles.title}>Scenario Details</Text>
          <Text style={styles.text}>Generated: {generatedAt.toLocaleDateString('nl-NL')}</Text>
          <Text style={styles.text}>Version: 1.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Input Parameters</Text>
          {Object.entries(scenario).map(([key, value]) => (
            <Text key={key} style={styles.text}>
              {key}: {typeof value === 'number' ? `€${value.toLocaleString()}` : String(value)}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Results</Text>
          {Object.entries(results).map(([key, value]) => (
            <Text key={key} style={styles.text}>
              {key}: {typeof value === 'number' ? `€${value.toLocaleString()}` : String(value)}
            </Text>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Disclaimer:</Text> Deze rapport is uitsluitend bedoeld voor 
            educatieve doeleinden en vormt geen persoonlijke financiële ondersteuning. Raadpleeg altijd 
            een gekwalificeerde adviseur voor maatwerkbegeleiding. De berekeningen zijn gebaseerd op 
            standaard tarieven en kunnen afwijken van uw specifieke situatie.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export function generatePdfUrl(title: string, scenario: Record<string, string | number | boolean>, results: Record<string, string | number | boolean>) {
  // In a real implementation, you would generate the PDF server-side
  // and return a URL to the generated file
  return `/api/reports/generate?title=${encodeURIComponent(title)}&scenario=${encodeURIComponent(JSON.stringify(scenario))}&results=${encodeURIComponent(JSON.stringify(results))}`
}

// Parse markdown content naar PDF elementen
function parseMarkdown(content: string): React.ReactElement[] {
  const elements: React.ReactElement[] = []
  const lines = content.split('\n')
  
  let currentParagraph: string[] = []
  let inJsonBlock = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip ANALYSIS_SCORES tags en JSON blokken
    if (line.includes('<ANALYSIS_SCORES>') || line.includes('</ANALYSIS_SCORES>')) {
      inJsonBlock = line.includes('<ANALYSIS_SCORES>')
      continue
    }
    
    if (inJsonBlock) {
      // Skip regels binnen JSON blok
      if (line.includes('}') && line.includes('overallScore')) {
        inJsonBlock = false
      }
      continue
    }
    
    // Skip regels die op JSON lijken (bevatten "overallScore", "shortTerm", etc.)
    if (line.includes('"overallScore"') || line.includes('"shortTerm"') || 
        line.includes('"mediumTerm"') || line.includes('"longTerm"') ||
        (line.startsWith('{') && line.includes('score'))) {
      continue
    }
    
    // Skip lege regels
    if (!line) {
      if (currentParagraph.length > 0) {
        elements.push(
          <Text key={`p-${i}`} style={styles.text}>
            {currentParagraph.join(' ')}
          </Text>
        )
        currentParagraph = []
      }
      continue
    }
    
    // Headers
    if (line.startsWith('# ')) {
      if (currentParagraph.length > 0) {
        elements.push(
          <Text key={`p-${i}`} style={styles.text}>
            {currentParagraph.join(' ')}
          </Text>
        )
        currentParagraph = []
      }
      elements.push(
        <Text key={`h1-${i}`} style={[styles.title, { fontSize: 20, marginTop: 15, marginBottom: 10 }]}>
          {line.substring(2)}
        </Text>
      )
    } else if (line.startsWith('## ')) {
      if (currentParagraph.length > 0) {
        elements.push(
          <Text key={`p-${i}`} style={styles.text}>
            {currentParagraph.join(' ')}
          </Text>
        )
        currentParagraph = []
      }
      elements.push(
        <Text key={`h2-${i}`} style={[styles.title, { fontSize: 16, marginTop: 12, marginBottom: 8 }]}>
          {line.substring(3)}
        </Text>
      )
    } else if (line.startsWith('### ')) {
      if (currentParagraph.length > 0) {
        elements.push(
          <Text key={`p-${i}`} style={styles.text}>
            {currentParagraph.join(' ')}
          </Text>
        )
        currentParagraph = []
      }
      elements.push(
        <Text key={`h3-${i}`} style={[styles.title, { fontSize: 14, marginTop: 10, marginBottom: 6 }]}>
          {line.substring(4)}
        </Text>
      )
    } else {
      // Normale tekst
      currentParagraph.push(line)
    }
  }
  
  // Laatste paragraaf
  if (currentParagraph.length > 0) {
    elements.push(
      <Text key="p-final" style={styles.text}>
        {currentParagraph.join(' ')}
      </Text>
    )
  }
  
  return elements
}

interface DeepResearchPDFProps {
  title: string
  symbol: string
  name: string
  content: string
  quote: Record<string, unknown> | null
  fundamentals: Record<string, unknown> | null
  scores?: {
    overallScore: number
    shortTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
    mediumTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
    longTerm: { score: number; prediction: string; timeframe: string; keyFactors: string[] }
  } | null
  history?: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>
  generatedAt: Date
}

// Helper functie om score label te krijgen
function getScoreLabel(score: number): string {
  if (score >= 86) return "Uitstekend"
  if (score >= 76) return "Zeer Goed"
  if (score >= 61) return "Goed"
  if (score >= 41) return "Neutraal"
  return "Risicovol"
}

// Helper functie om score kleur te krijgen
function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981" // green
  if (score >= 60) return "#3b82f6" // blue
  if (score >= 40) return "#eab308" // yellow
  return "#ef4444" // red
}

// Helper functies voor grafiek data
function prepareChartData(history: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }> = [], fundamentals: Record<string, unknown> | null) {
  // Koers data - laatste 12 maanden (maandelijks gemiddelde)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  oneYearAgo.setMonth(oneYearAgo.getMonth() - 1) // Extra maand voor zekerheid
  
  const last12MonthsData = history.filter(h => new Date(h.date) >= oneYearAgo)
  
  // Groepeer per maand
  const monthlyData: Record<string, Array<{ date: string; close: number; volume: number }>> = {}
  last12MonthsData.forEach(h => {
    const date = new Date(h.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = []
    }
    monthlyData[monthKey].push({ date: h.date, close: h.close, volume: h.volume })
  })
  
  // Sorteer maanden en bereken gemiddelde per maand
  const sortedMonths = Object.keys(monthlyData).sort().slice(-12) // Laatste 12 maanden
  const priceData = sortedMonths.map(monthKey => {
    const monthData = monthlyData[monthKey]
    const avgPrice = monthData.reduce((sum, d) => sum + d.close, 0) / monthData.length
    const monthVolume = monthData.reduce((sum, d) => sum + d.volume, 0) / monthData.length
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return {
      date: date.toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' }),
      prijs: avgPrice,
      volume: monthVolume,
    }
  })

  // Koers data - laatste 10 jaar (jaarlijks gemiddelde)
  const tenYearsAgo = new Date()
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
  
  const last10YearsData = history.filter(h => new Date(h.date) >= tenYearsAgo)
  
  // Groepeer per jaar
  const yearlyData: Record<string, Array<{ date: string; close: number; volume: number }>> = {}
  last10YearsData.forEach(h => {
    const date = new Date(h.date)
    const yearKey = date.getFullYear().toString()
    if (!yearlyData[yearKey]) {
      yearlyData[yearKey] = []
    }
    yearlyData[yearKey].push({ date: h.date, close: h.close, volume: h.volume })
  })
  
  // Sorteer jaren en bereken gemiddelde per jaar
  const sortedYears = Object.keys(yearlyData).sort((a, b) => parseInt(a) - parseInt(b))
  const priceData10Years = sortedYears.map(yearKey => {
    const yearData = yearlyData[yearKey]
    const yearPrice = yearData.reduce((sum, d) => sum + d.close, 0) / yearData.length
    const yearVolume = yearData.reduce((sum, d) => sum + d.volume, 0) / yearData.length
    return {
      date: yearKey,
      prijs: yearPrice,
      volume: yearVolume,
    }
  })

  // Revenue & Winst data
  const incomeStatements = (fundamentals?.incomeStatement as Array<Record<string, unknown>>) || []
  const revenueData = incomeStatements.slice(-5).reverse().map((item: Record<string, unknown>) => {
    const endDate = item.endDate as { fmt?: string; raw?: string | number } | undefined
    return {
      jaar: endDate?.fmt || endDate?.raw || 'N/A',
      omzet: item.totalRevenue ? ((item.totalRevenue as { raw?: number }).raw || (item.totalRevenue as number)) / 1e6 : 0,
      winst: item.netIncome ? ((item.netIncome as { raw?: number }).raw || (item.netIncome as number)) / 1e6 : 0,
    }
  })

  // Balance Sheet data
  const balanceSheetData = (fundamentals?.balanceSheet as Array<Record<string, unknown>>) || []
  const balanceData = balanceSheetData.slice(-5).reverse().map((item: Record<string, unknown>) => {
    const endDate = item.endDate as { fmt?: string; raw?: string | number } | undefined
    return {
      jaar: endDate?.fmt || endDate?.raw || 'N/A',
      activa: item.totalAssets ? ((item.totalAssets as { raw?: number }).raw || (item.totalAssets as number)) / 1e6 : 0,
      passiva: item.totalLiab ? ((item.totalLiab as { raw?: number }).raw || (item.totalLiab as number)) / 1e6 : 0,
      eigenVermogen: item.totalStockholderEquity ? ((item.totalStockholderEquity as { raw?: number }).raw || (item.totalStockholderEquity as number)) / 1e6 : 0,
    }
  })

  // Cashflow data
  const cashFlowData = (fundamentals?.cashFlow as Array<Record<string, unknown>>) || []
  const cashFlowChartData = cashFlowData.slice(-5).reverse().map((item: Record<string, unknown>) => {
    const endDate = item.endDate as { fmt?: string; raw?: string | number } | undefined
    const operating = item.totalCashFromOperatingActivities ? ((item.totalCashFromOperatingActivities as { raw?: number }).raw || (item.totalCashFromOperatingActivities as number)) / 1e6 : 0
    const capex = item.capitalExpenditures ? Math.abs(((item.capitalExpenditures as { raw?: number }).raw || (item.capitalExpenditures as number))) / 1e6 : 0
    return {
      jaar: endDate?.fmt || endDate?.raw || 'N/A',
      operating: operating,
      freeCashflow: operating - capex,
    }
  })

  // Groei per kwartaal
  const quarterlyGrowth: Array<{ kwartaal: string; gemiddeldePrijs: number; groei: number }> = []
  if (history.length > 0) {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const lastYearData = history.filter(h => new Date(h.date) >= oneYearAgo)
    
    const quarters: Record<string, Array<{ date: string; close: number }>> = {}
    lastYearData.forEach(h => {
      const date = new Date(h.date)
      const year = date.getFullYear()
      const quarter = Math.floor(date.getMonth() / 3) + 1
      const key = `${year}-Q${quarter}`
      
      if (!quarters[key]) {
        quarters[key] = []
      }
      quarters[key].push({ date: h.date, close: h.close })
    })
    
    const sortedQuarters = Object.keys(quarters).sort()
    sortedQuarters.forEach((key, index) => {
      const quarterData = quarters[key]
      const avgPrice = quarterData.reduce((sum, d) => sum + d.close, 0) / quarterData.length
      
      let growth = 0
      if (index > 0) {
        const prevKey = sortedQuarters[index - 1]
        const prevQuarterData = quarters[prevKey]
        const prevAvgPrice = prevQuarterData.reduce((sum, d) => sum + d.close, 0) / prevQuarterData.length
        growth = ((avgPrice - prevAvgPrice) / prevAvgPrice) * 100
      }
      
      quarterlyGrowth.push({
        kwartaal: key,
        gemiddeldePrijs: avgPrice,
        groei: growth
      })
    })
  }

  return {
    priceData,
    priceData10Years,
    revenueData,
    balanceData,
    cashFlowChartData,
    quarterlyGrowth,
  }
}

// Helper functies voor grafiek berekeningen
function normalizeValue(value: number, min: number, max: number, height: number, padding: number = 20): number {
  if (max === min) return height / 2
  return padding + (height - 2 * padding) * (1 - (value - min) / (max - min))
}

function getMinMax(data: number[], allowNegative = false): { min: number; max: number } {
  if (data.length === 0) return { min: 0, max: 100 }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min
  const margin = range * 0.1 // 10% marge
  return { 
    min: allowNegative ? min - margin : Math.max(0, min - margin), 
    max: max + margin 
  }
}

// Line Chart Component
function LineChart({ 
  title, 
  data, 
  dataKey, 
  xKey, 
  width = 500, 
  height = 200,
  color = '#3b82f6',
  showArea = false 
}: { 
  title: string
  data: Array<Record<string, number | string>>
  dataKey: string
  xKey: string
  width?: number
  height?: number
  color?: string
  showArea?: boolean
}) {
  if (data.length === 0) return null

  const values = data.map(d => Number(d[dataKey])).filter(v => !isNaN(v))
  const { min, max } = getMinMax(values)
  
  const chartWidth = width - 60 // Ruimte voor labels
  const chartHeight = height - 40
  const padding = 20
  
  // Bereken punten voor de lijn
  const points = data.map((d, i) => {
    const x = padding + (i * chartWidth) / (data.length - 1 || 1)
    const y = normalizeValue(Number(d[dataKey]), min, max, chartHeight, padding)
    return { x, y, value: Number(d[dataKey]), label: String(d[xKey]) }
  })

  // Maak path voor de lijn
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  
  // Maak area path als nodig
  const areaPath = showArea 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight + padding} L ${points[0].x} ${chartHeight + padding} Z`
    : ''

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Svg width={width} height={height} style={styles.chartSvg}>
        <Defs>
          <LinearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * chartHeight
          const value = max - ratio * (max - min)
          return (
            <G key={i}>
              <Line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
              <Text
                x={padding - 5}
                y={y + 3}
                style={{ fontSize: 8, fill: '#6b7280', textAnchor: 'end' }}
              >
                {value.toFixed(1)}
              </Text>
            </G>
          )
        })}

        {/* Area onder de lijn */}
        {showArea && areaPath && (
          <Path
            d={areaPath}
            fill={`url(#gradient-${title})`}
          />
        )}

        {/* Lijn */}
        <Path
          d={linePath}
          stroke={color}
          strokeWidth={2}
          fill="none"
        />

        {/* Data punten */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}

        {/* X-as labels */}
        {points.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map((p, i) => (
          <Text
            key={i}
            x={p.x}
            y={chartHeight + padding + 15}
            style={{ fontSize: 7, fill: '#6b7280', textAnchor: 'middle' }}
          >
            {p.label.length > 8 ? p.label.substring(0, 8) + '...' : p.label}
          </Text>
        ))}
      </Svg>
    </View>
  )
}

// Bar Chart Component
function BarChart({
  title,
  data,
  dataKeys,
  xKey,
  width = 500,
  height = 200,
  colors = ['#3b82f6', '#10b981', '#8b5cf6'],
  getColor
}: {
  title: string
  data: Array<Record<string, number | string>>
  dataKeys: string[]
  xKey: string
  width?: number
  height?: number
  colors?: string[]
  getColor?: (value: number, keyIndex: number) => string
}) {
  if (data.length === 0) return null

  const allValues = data.flatMap(d => dataKeys.map(key => Number(d[key])).filter(v => !isNaN(v)))
  const hasNegative = allValues.some(v => v < 0)
  const { min, max } = getMinMax(allValues, hasNegative)
  
  const chartWidth = width - 60
  const chartHeight = height - 40
  const padding = 20
  const barWidth = (chartWidth / data.length) * 0.6
  const barSpacing = chartWidth / data.length
  const zeroY = normalizeValue(0, min, max, chartHeight, padding)

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Svg width={width} height={height} style={styles.chartSvg}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * chartHeight
          const value = max - ratio * (max - min)
          return (
            <G key={i}>
              <Line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
              <Text
                x={padding - 5}
                y={y + 3}
                style={{ fontSize: 8, fill: '#6b7280', textAnchor: 'end' }}
              >
                {value.toFixed(1)}
              </Text>
            </G>
          )
        })}
        
        {/* Zero line voor negatieve waarden */}
        {hasNegative && (
          <Line
            x1={padding}
            y1={zeroY}
            x2={width - padding}
            y2={zeroY}
            stroke="#374151"
            strokeWidth={1}
          />
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padding + i * barSpacing + (barSpacing - barWidth * dataKeys.length) / 2
          return (
            <G key={i}>
              {dataKeys.map((key, keyIdx) => {
                const value = Number(d[key])
                const valueY = normalizeValue(value, min, max, chartHeight, padding)
                const barHeight = Math.abs(zeroY - valueY)
                const barX = x + keyIdx * barWidth
                const barY = value < 0 ? zeroY : valueY
                const fillColor = getColor ? getColor(value, keyIdx) : colors[keyIdx % colors.length]
                return (
                  <Rect
                    key={keyIdx}
                    x={barX}
                    y={barY}
                    width={barWidth * 0.9}
                    height={barHeight}
                    fill={fillColor}
                    rx={2}
                  />
                )
              })}
            </G>
          )
        })}

        {/* X-as labels */}
        {data.map((d, i) => {
          const x = padding + i * barSpacing + barSpacing / 2
          return (
            <Text
              key={i}
              x={x}
              y={chartHeight + padding + 15}
              style={{ fontSize: 7, fill: '#6b7280', textAnchor: 'middle' }}
            >
              {String(d[xKey]).length > 8 ? String(d[xKey]).substring(0, 8) + '...' : String(d[xKey])}
            </Text>
          )
        })}
      </Svg>
      
      {/* Legend */}
      <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {dataKeys.map((key, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 5 }}>
            <View style={{ width: 12, height: 12, backgroundColor: colors[i % colors.length], marginRight: 5 }} />
            <Text style={{ fontSize: 8, color: '#6b7280' }}>{key}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export function DeepResearchPDF({
  title,
  symbol,
  name,
  content,
  quote,
  fundamentals,
  scores,
  history = [],
  generatedAt,
}: DeepResearchPDFProps) {
  // Verwijder eventuele resterende JSON scores uit de content
  let cleanContent = content
  if (content) {
    // Verwijder ANALYSIS_SCORES tags en inhoud
    cleanContent = cleanContent.replace(/<ANALYSIS_SCORES>[\s\S]*?<\/ANALYSIS_SCORES>/g, '').trim()
    // Verwijder ook losse JSON objecten die op scores lijken
    cleanContent = cleanContent.replace(/\{[\s\S]*?"overallScore"[\s\S]*?\}/g, '').trim()
  }
  
  const contentElements = parseMarkdown(cleanContent)
  const chartData = prepareChartData(history, fundamentals)
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{title}</Text>
        
        <View style={styles.section}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Symbool:</Text> {symbol}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Naam:</Text> {name}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Gegenereerd op:</Text> {generatedAt.toLocaleDateString('nl-NL')} om {generatedAt.toLocaleTimeString('nl-NL')}
          </Text>
        </View>

        {/* Scores Sectie - Visueel */}
        {scores && (
          <View style={styles.section}>
            <Text style={styles.title}>Analyse Scores</Text>
            
            {/* Overall Score */}
            <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#f9fafb', borderRadius: 5 }}>
              <Text style={[styles.text, { fontSize: 14, marginBottom: 5 }]}>
                <Text style={styles.bold}>Overall Score: </Text>
                <Text style={{ color: getScoreColor(scores.overallScore) }}>
                  {scores.overallScore}/100 - {getScoreLabel(scores.overallScore)}
                </Text>
              </Text>
            </View>

            {/* Korte Termijn */}
            <View style={{ marginBottom: 10, padding: 8, backgroundColor: '#eff6ff', borderRadius: 5 }}>
              <Text style={[styles.text, { fontSize: 13, marginBottom: 3 }]}>
                <Text style={styles.bold}>Korte Termijn ({scores.shortTerm.timeframe}): </Text>
                <Text style={{ color: getScoreColor(scores.shortTerm.score) }}>
                  {scores.shortTerm.score}/100
                </Text>
              </Text>
              <Text style={[styles.text, { fontSize: 11, marginBottom: 3, fontStyle: 'italic' }]}>
                {scores.shortTerm.prediction}
              </Text>
              <Text style={[styles.text, { fontSize: 10, marginTop: 3 }]}>
                <Text style={styles.bold}>Belangrijke factoren: </Text>
                {scores.shortTerm.keyFactors.join(', ')}
              </Text>
            </View>

            {/* Midden Lange Termijn */}
            <View style={{ marginBottom: 10, padding: 8, backgroundColor: '#f3e8ff', borderRadius: 5 }}>
              <Text style={[styles.text, { fontSize: 13, marginBottom: 3 }]}>
                <Text style={styles.bold}>Midden Lange Termijn ({scores.mediumTerm.timeframe}): </Text>
                <Text style={{ color: getScoreColor(scores.mediumTerm.score) }}>
                  {scores.mediumTerm.score}/100
                </Text>
              </Text>
              <Text style={[styles.text, { fontSize: 11, marginBottom: 3, fontStyle: 'italic' }]}>
                {scores.mediumTerm.prediction}
              </Text>
              <Text style={[styles.text, { fontSize: 10, marginTop: 3 }]}>
                <Text style={styles.bold}>Belangrijke factoren: </Text>
                {scores.mediumTerm.keyFactors.join(', ')}
              </Text>
            </View>

            {/* Lange Termijn */}
            <View style={{ marginBottom: 15, padding: 8, backgroundColor: '#ecfdf5', borderRadius: 5 }}>
              <Text style={[styles.text, { fontSize: 13, marginBottom: 3 }]}>
                <Text style={styles.bold}>Lange Termijn ({scores.longTerm.timeframe}): </Text>
                <Text style={{ color: getScoreColor(scores.longTerm.score) }}>
                  {scores.longTerm.score}/100
                </Text>
              </Text>
              <Text style={[styles.text, { fontSize: 11, marginBottom: 3, fontStyle: 'italic' }]}>
                {scores.longTerm.prediction}
              </Text>
              <Text style={[styles.text, { fontSize: 10, marginTop: 3 }]}>
                <Text style={styles.bold}>Belangrijke factoren: </Text>
                {scores.longTerm.keyFactors.join(', ')}
              </Text>
            </View>
          </View>
        )}

        {quote && (
          <View style={styles.section}>
            <Text style={styles.title}>Huidige Koersinformatie</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>Prijs:</Text> ${typeof quote.price === 'number' ? quote.price.toFixed(2) : 'N/A'}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>Verandering:</Text> {typeof quote.changePercent === 'number' ? quote.changePercent.toFixed(2) : 'N/A'}%
            </Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>Volume:</Text> {typeof quote.volume === 'number' ? quote.volume.toLocaleString() : 'N/A'}
            </Text>
          </View>
        )}

        {fundamentals && (
          <View style={styles.section}>
            <Text style={styles.title}>Belangrijkste Kentallen</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>P/E Ratio:</Text> {typeof fundamentals.trailingPE === 'number' ? fundamentals.trailingPE.toFixed(2) : 'N/A'}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>Marktkapitalisatie:</Text> {typeof fundamentals.marketCap === 'number' ? `$${(fundamentals.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>Sector:</Text> {typeof fundamentals.sector === 'string' ? fundamentals.sector : 'N/A'}
            </Text>
          </View>
        )}

        {/* Grafieken Sectie */}
        {(chartData.priceData.length > 0 || chartData.priceData10Years?.length > 0 || chartData.revenueData.length > 0 || chartData.balanceData.length > 0 || chartData.cashFlowChartData.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.title}>Grafieken & Data</Text>
            
            {/* Koersgrafiek - Area Chart (12 maanden) */}
            {chartData.priceData.length > 0 && (
              <LineChart
                title="Koersontwikkeling (Laatste 12 Maanden)"
                data={chartData.priceData.map(d => ({ date: d.date, prijs: d.prijs }))}
                dataKey="prijs"
                xKey="date"
                width={500}
                height={180}
                color="#3b82f6"
                showArea={true}
              />
            )}

            {/* Koersgrafiek - Area Chart (10 jaar) */}
            {chartData.priceData10Years && chartData.priceData10Years.length > 0 && (
              <LineChart
                title="Koersontwikkeling (Laatste 10 Jaar)"
                data={chartData.priceData10Years.map(d => ({ date: d.date, prijs: d.prijs }))}
                dataKey="prijs"
                xKey="date"
                width={500}
                height={180}
                color="#8b5cf6"
                showArea={true}
              />
            )}

            {/* Revenue & Winst - Bar Chart */}
            {chartData.revenueData.length > 0 && (
              <BarChart
                title="Omzet & Winst Trend"
                data={chartData.revenueData}
                dataKeys={['omzet', 'winst']}
                xKey="jaar"
                width={500}
                height={180}
                colors={['#3b82f6', '#10b981']}
              />
            )}

            {/* Balance Sheet - Bar Chart */}
            {chartData.balanceData.length > 0 && (
              <BarChart
                title="Balans Structuur"
                data={chartData.balanceData}
                dataKeys={['activa', 'passiva', 'eigenVermogen']}
                xKey="jaar"
                width={500}
                height={180}
                colors={['#8b5cf6', '#ef4444', '#10b981']}
              />
            )}

            {/* Cashflow - Line Chart */}
            {chartData.cashFlowChartData.length > 0 && (
              <LineChart
                title="Cashflow Trend"
                data={chartData.cashFlowChartData.map(d => ({ jaar: d.jaar, operating: d.operating, freeCashflow: d.freeCashflow }))}
                dataKey="operating"
                xKey="jaar"
                width={500}
                height={180}
                color="#3b82f6"
                showArea={false}
              />
            )}

            {/* Groei per Kwartaal - Bar Chart met kleuren op basis van waarde */}
            {chartData.quarterlyGrowth.length > 0 && (
              <BarChart
                title="Groei per Kwartaal (Laatste Jaar)"
                data={chartData.quarterlyGrowth.map(d => ({ kwartaal: d.kwartaal, groei: d.groei }))}
                dataKeys={['groei']}
                xKey="kwartaal"
                width={500}
                height={180}
                colors={['#10b981']}
                getColor={(value) => value >= 0 ? '#10b981' : '#ef4444'}
              />
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.title}>Onderzoeksrapport</Text>
          {contentElements}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Disclaimer:</Text> Dit rapport is gegenereerd met behulp van AI en is uitsluitend bedoeld voor 
            educatieve en informatieve doeleinden. Het vormt geen persoonlijk financieel advies, beleggingsadvies of aanbeveling tot 
            koop of verkoop van effecten. Raadpleeg altijd een gekwalificeerde financieel adviseur voordat u beleggingsbeslissingen neemt. 
            De informatie in dit rapport is gebaseerd op beschikbare data en kan onvolledig of verouderd zijn. 
            Beleggen brengt risico&apos;s met zich mee en u kunt uw inleg verliezen.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
