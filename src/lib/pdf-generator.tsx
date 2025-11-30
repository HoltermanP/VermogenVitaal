import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
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

export function DeepResearchPDF({
  title,
  symbol,
  name,
  content,
  quote,
  fundamentals,
  scores,
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
