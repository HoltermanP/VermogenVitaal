# Tax & Wealth Hub

Een complete MVP voor belastingadvies en vermogensopbouw voor Nederlandse ondernemers.

## 🚀 Features

- **Smart Calculators**: BV vs EMZ, ETF-groei, Vastgoed cashflow, Crypto allocatie
- **AI-Powered Insights**: RAG-gebaseerde adviezen met bronvermelding
- **Document Management**: Veilige upload en status tracking
- **Community Q&A**: Expert vragen en antwoorden
- **Tier-based Access**: Gratis, Basic, Pro, Elite abonnementen
- **PDF Reports**: Professionele rapporten met grafieken
- **EU Vastgoed**: Specialisatie in Europese vastgoed
- **Crypto Educatie**: Transparante crypto-educatie

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Email**: Resend
- **Analytics**: PostHog
- **PDF**: @react-pdf/renderer
- **Charts**: Recharts

## 📦 Installatie

1. **Clone de repository**
   ```bash
   git clone <repository-url>
   cd tax-wealth-hub
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Configureer environment variabelen**
   ```bash
   cp env.example .env.local
   ```
   
   Vul de volgende variabelen in:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/tax_wealth_hub"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # Resend
   RESEND_API_KEY="re_..."
   
   # PostHog
   NEXT_PUBLIC_POSTHOG_KEY="phc_..."
   NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
   
   # OpenAI (optioneel)
   OPENAI_API_KEY="sk-..."
   ```

4. **Setup database**
   ```bash
   # Genereer Prisma client
   npm run db:generate
   
   # Push schema naar database
   npm run db:push
   
   # Seed demo data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

### Core Models

- **User**: Gebruikers met rollen (USER, ADMIN) en tiers (FREE, BASIC, PRO, ELITE)
- **ProfileFinancials**: Financiële profielgegevens
- **Scenario**: Calculator scenario's en resultaten
- **Document**: Geüploade documenten met status tracking
- **Report**: Gegenereerde PDF rapporten
- **Knowledge**: Kennisbank artikelen voor RAG
- **Payment**: Stripe betalingen en abonnementen
- **Ticket**: Support tickets voor Pro/Elite gebruikers
- **AuditLog**: Audit trail voor compliance

## 🧮 Calculators

### 1. BV vs EMZ Calculator
- Vergelijkt fiscale gevolgen van BV vs EMZ
- Inclusief MKB-winstvrijstelling, zelfstandigenaftrek
- Gevoeligheidsanalyse bij omzetwijzigingen
- Advies op basis van specifieke situatie

### 2. ETF Groei Calculator
- Projecteert ETF portefeuille groei
- Pessimistisch, verwacht en optimistisch scenario
- Box 3 belasting berekening
- Kosten impact analyse

### 3. Vastgoed Cashflow Calculator
- NL en EU vastgoed ondersteuning
- Cashflow, yield, DSCR berekeningen
- Gevoeligheidsanalyse rente/huur
- Box 3, IB, VPB varianten

### 4. Crypto Allocatie Calculator
- Educatieve crypto allocatie adviezen
- Risicoprofiel gebaseerde aanbevelingen
- Custody en beveiliging adviezen
- Geen koersvoorspellingen

## 🤖 AI & RAG

- **Knowledge Base**: MDX artikelen met metadata
- **RAG Endpoint**: `/api/advise/summary`
- **Bronvermelding**: Transparante citaties
- **Rate Limiting**: Per gebruiker caching
- **Disclaimer**: Verplichte waarschuwingen

## 💳 Abonnementen

### Gratis
- QuickScan Belasting (5 min)
- ETF basisallocatie
- 3 kennisbankartikelen
- Community lezen

### Basic (€12/maand)
- Uitgebreide calculators
- PDF export
- RAG-samenvattingen
- Onbeperkte kennisbank

### Pro (€39/maand)
- Document upload
- Scenariovergelijking
- Expert Q&A
- Aangifte-check (€149 add-on)

### Elite (€99/maand)
- Aangifte indienen
- Video consult (kwartaal)
- Prioriteitssupport
- Persoonlijke adviseur

## 🔒 Compliance

- **AVG-compliant**: Dataminimalisatie, encryptie
- **Disclaimers**: Verplicht bij alle adviezen
- **Audit Logging**: Volledige activiteit tracking
- **Verwerkersovereenkomsten**: Supabase, Stripe, Resend
- **Affiliate Transparantie**: Duidelijke labeling

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:ui

# Linting
npm run lint

# Formatting
npm run format
```

## 📊 Analytics

- **PostHog**: Gebruikersgedrag en conversie
- **Audit Logs**: Compliance en beveiliging
- **Performance**: Core Web Vitals monitoring

## 🚀 Deployment

### Vercel (Aanbevolen)

1. **Connect repository** aan Vercel
2. **Configure environment variables**
3. **Setup Supabase** database
4. **Configure Stripe** webhooks
5. **Deploy**

### Environment Variables

Zorg dat alle environment variabelen zijn geconfigureerd in je deployment platform.

## 📝 API Endpoints

### Authentication
- `GET /api/auth/[...nextauth]` - NextAuth endpoints

### Calculators
- `POST /api/calculators/bv-vs-emz` - BV vs EMZ berekening
- `POST /api/calculators/etf` - ETF groei berekening
- `POST /api/calculators/real-estate` - Vastgoed cashflow
- `POST /api/calculators/crypto` - Crypto allocatie

### AI & RAG
- `POST /api/advise/summary` - RAG samenvatting

### Reports
- `GET /api/reports/generate` - PDF generatie
- `GET /api/reports/[id]` - Rapport download

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhooks

## 🔧 Development

### Database Migrations

```bash
# Create migration
npm run db:migrate

# Reset database
npm run db:push --force-reset

# Seed data
npm run db:seed
```

### Code Quality

```bash
# Lint check
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📚 Documentatie

- **API Docs**: `/api/docs` (Swagger)
- **Component Library**: Storybook
- **Database Schema**: Prisma Studio
- **Analytics**: PostHog Dashboard

## 🤝 Contributing

1. Fork de repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 Licentie

Dit project is eigendom van Tax & Wealth Hub. Alle rechten voorbehouden.

## 📞 Support

- **Email**: support@taxwealthhub.nl
- **Documentatie**: [docs.taxwealthhub.nl](https://docs.taxwealthhub.nl)
- **Status**: [status.taxwealthhub.nl](https://status.taxwealthhub.nl)

---

**Disclaimer**: Deze applicatie is uitsluitend bedoeld voor educatieve doeleinden en vormt geen persoonlijk financieel advies. Raadpleeg altijd een gekwalificeerde adviseur voor maatwerkadvies.