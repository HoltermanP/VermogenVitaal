import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reportId = id

    // Mock PDF content (in production this would be a real PDF)
    const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
100 700 Td
(Tax & Wealth Hub - Rapport) Tj
0 -20 Td
(Rapport ID: ${reportId}) Tj
0 -20 Td
(Generated: ${new Date().toLocaleDateString('nl-NL')}) Tj
0 -20 Td
(Dit is een mock PDF voor demonstratie doeleinden) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000521 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
625
%%EOF`

    return new NextResponse(mockPdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-${reportId}.pdf"`,
        'Content-Length': mockPdfContent.length.toString()
      }
    })
  } catch (error) {
    console.error("PDF download error:", error)
    return NextResponse.json(
      { error: "Interne server fout" },
      { status: 500 }
    )
  }
}
