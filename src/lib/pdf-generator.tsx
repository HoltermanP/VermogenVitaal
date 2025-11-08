import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

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
            educatieve doeleinden en vormt geen persoonlijk financieel advies. Raadpleeg altijd 
            een gekwalificeerde adviseur voor maatwerkadvies. De berekeningen zijn gebaseerd op 
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
