export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Tax & Wealth Hub - Test Page
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Status</h2>
              <ul className="space-y-2">
                <li>✅ Next.js 14 App Router</li>
                <li>✅ TypeScript</li>
                <li>✅ Tailwind CSS</li>
                <li>✅ shadcn/ui Components</li>
                <li>✅ Prisma Schema</li>
                <li>✅ Calculator Logic</li>
                <li>✅ RAG System</li>
                <li>✅ Stripe Integration</li>
                <li>✅ PDF Generation</li>
                <li>✅ Community Q&A</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2">
                <li>🧮 BV vs EMZ Calculator</li>
                <li>📈 ETF Groei Calculator</li>
                <li>🏠 Vastgoed Cashflow Calculator</li>
                <li>₿ Crypto Allocatie Calculator</li>
                <li>🤖 AI-Powered RAG</li>
                <li>📄 PDF Report Generation</li>
                <li>👥 Community Q&A</li>
                <li>💳 Stripe Subscriptions</li>
                <li>🔒 AVG Compliance</li>
                <li>📊 Analytics & Audit</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Configureer Supabase database</li>
              <li>Setup Stripe webhooks</li>
              <li>Configureer Resend email</li>
              <li>Setup PostHog analytics</li>
              <li>Deploy naar Vercel</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
