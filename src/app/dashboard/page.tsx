import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator, FileText, Users, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Sparkles, Zap, Target, FileCheck } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // Temporarily disabled authentication for testing
  const user = { name: "Test Gebruiker", email: "test@example.com" }
  const tier: 'FREE' | 'BASIC' | 'PRO' | 'ELITE' = 'FREE'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-fade-in">
                Welkom terug, {user.name || user.email}!
              </h1>
              <p className="text-gray-300 text-lg animate-fade-in delay-200">Hier is een overzicht van je fiscale dashboard</p>
            </div>
            <div className="flex items-center gap-4 animate-fade-in delay-300">
              <Badge variant={tier === 'FREE' ? 'secondary' : 'default'} className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 transition-colors">
                {tier} Plan
              </Badge>
              {tier === 'FREE' && (
                <Badge variant="outline" className="text-blue-400 border-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                  <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                  Upgrade beschikbaar
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group hover:scale-105 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/25">
                <Calculator className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-white text-xl group-hover:text-blue-300 transition-colors">Calculators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6 group-hover:text-gray-200 transition-colors">
                Bereken je fiscale optimalisatie
              </p>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 w-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300" asChild>
                <Link href="/calculators">
                  Start berekening
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 group hover:scale-105 animate-fade-in delay-100">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-emerald-500/25">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-white text-xl group-hover:text-emerald-300 transition-colors">Documenten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6 group-hover:text-gray-200 transition-colors">
                {tier === 'FREE' ? 'Upload documenten (Pro+)' : 'Beheer je documenten'}
              </p>
              <Button 
                size="sm" 
                variant={tier === 'FREE' ? 'outline' : 'default'}
                className={tier === 'FREE' ? 'border-slate-600 text-slate-400 hover:bg-slate-700/50' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300'}
                asChild
                disabled={tier === 'FREE'}
              >
                <Link href={tier === 'FREE' ? '/pricing' : '/documents'}>
                  {tier === 'FREE' ? 'Upgrade nodig' : 'Bekijk documenten'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 group hover:scale-105 animate-fade-in delay-200">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-violet-500/25">
                <Users className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-white text-xl group-hover:text-violet-300 transition-colors">Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6 group-hover:text-gray-200 transition-colors">
                {tier === 'FREE' ? 'Lees community (Pro+ posten)' : 'Stel vragen aan experts'}
              </p>
              <Button 
                size="sm" 
                variant={tier === 'FREE' ? 'outline' : 'default'}
                className={tier === 'FREE' ? 'border-slate-600 text-slate-400 hover:bg-slate-700/50' : 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300'}
                asChild
              >
                <Link href="/community">
                  {tier === 'FREE' ? 'Bekijk community' : 'Ga naar community'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 group hover:scale-105 animate-fade-in delay-300">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-amber-500/25">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-white text-xl group-hover:text-amber-300 transition-colors">Rapporten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6 group-hover:text-gray-200 transition-colors">
                Bekijk je gegenereerde rapporten
              </p>
              <Button size="sm" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-0 w-full shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300" asChild>
                <Link href="/reports">
                  Bekijk rapporten
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 group hover:scale-105 animate-fade-in delay-400">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-orange-500/25">
                <FileCheck className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-white text-xl group-hover:text-orange-300 transition-colors">Admin Controle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6 group-hover:text-gray-200 transition-colors">
                Controleer je administratie met AI
              </p>
              <Button size="sm" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0 w-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300" asChild>
                <Link href="/audit">
                  Start controle
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress & Next Steps */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 animate-fade-in delay-400">
            <CardHeader>
              <CardTitle className="text-white text-2xl group-hover:text-blue-300 transition-colors">Onboarding Voortgang</CardTitle>
              <CardDescription className="text-gray-300">
                Voltooi je profiel voor betere adviezen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">Profiel compleet</span>
                  <span className="text-gray-400">2/4 stappen</span>
                </div>
                <Progress value={50} className="h-2 bg-slate-700" />
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 animate-pulse" />
                    <span className="text-gray-300">Basis profiel</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 animate-pulse" />
                    <span className="text-gray-300">Interesses</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <AlertCircle className="h-5 w-5 text-amber-400 mr-3 animate-pulse" />
                    <span className="text-gray-300">Risicoprofiel</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <AlertCircle className="h-5 w-5 text-amber-400 mr-3 animate-pulse" />
                    <span className="text-gray-300">Toestemmingen</span>
                  </div>
                </div>

                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300" asChild>
                  <Link href="/onboarding">Voltooi profiel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 animate-fade-in delay-500">
            <CardHeader>
              <CardTitle className="text-white text-2xl group-hover:text-purple-300 transition-colors">Volgende Stappen</CardTitle>
              <CardDescription className="text-gray-300">
                Aanbevelingen op basis van je tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tier === 'FREE' && (
                  <>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-blue-400 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-blue-300">Upgrade naar Pro</h4>
                      </div>
                      <p className="text-sm text-blue-200">
                        Krijg toegang tot document upload en expert Q&A
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-emerald-400 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-emerald-300">Probeer calculators</h4>
                      </div>
                      <p className="text-sm text-emerald-200">
                        Start met BV vs EMZ of ETF berekening
                      </p>
                    </div>
                  </>
                )}

                {/* Tier-specific features - will be shown when tier is upgraded */}
                {tier !== 'FREE' && tier === 'BASIC' && (
                  <>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-blue-400 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-blue-300">Upgrade naar Pro</h4>
                      </div>
                      <p className="text-sm text-blue-200">
                        Upload documenten en krijg persoonlijk advies
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-emerald-400 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-emerald-300">Genereer rapporten</h4>
                      </div>
                      <p className="text-sm text-emerald-200">
                        Export je berekeningen als PDF
                      </p>
                    </div>
                  </>
                )}

                {tier !== 'FREE' && tier === 'PRO' && (
                  <>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-blue-400 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-blue-300">Upload documenten</h4>
                      </div>
                      <p className="text-sm text-blue-200">
                        Upload je aangifte voor persoonlijke analyse
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-emerald-400 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-emerald-300">Stel expert vragen</h4>
                      </div>
                      <p className="text-sm text-emerald-200">
                        Gebruik de Q&A voor specifieke vragen
                      </p>
                    </div>
                  </>
                )}

                {tier !== 'FREE' && tier === 'ELITE' && (
                  <>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-blue-400 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-blue-300">Plan video consult</h4>
                      </div>
                      <p className="text-sm text-blue-200">
                        Boek je kwartaal consult
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-emerald-400 mr-2 animate-pulse" />
                        <h4 className="font-semibold text-emerald-300">Aangifte indienen</h4>
                      </div>
                      <p className="text-sm text-emerald-200">
                        Laat ons je aangifte afhandelen
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 animate-fade-in delay-600">
          <CardHeader>
            <CardTitle className="text-white text-2xl group-hover:text-green-300 transition-colors">Recente Activiteit</CardTitle>
            <CardDescription className="text-gray-300">
              Je laatste berekeningen en activiteiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 border border-slate-600 rounded-xl hover:bg-slate-700 hover:border-blue-500/50 transition-all duration-300 group">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">BV vs EMZ berekening</p>
                    <p className="text-sm text-gray-400">2 dagen geleden</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-blue-500/50 hover:text-blue-300 transition-all duration-300" asChild>
                  <Link href="/reports/1">Bekijk</Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/50 border border-slate-600 rounded-xl hover:bg-slate-700 hover:border-emerald-500/50 transition-all duration-300 group">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/25">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">ETF groei scenario</p>
                    <p className="text-sm text-gray-400">1 week geleden</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-emerald-500/50 hover:text-emerald-300 transition-all duration-300" asChild>
                  <Link href="/reports/2">Bekijk</Link>
                </Button>
              </div>

              {tier !== 'FREE' && (
                <div className="flex items-center justify-between p-4 bg-slate-700/50 border border-slate-600 rounded-xl hover:bg-slate-700 hover:border-violet-500/50 transition-all duration-300 group">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/25">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-violet-300 transition-colors">Document geüpload</p>
                      <p className="text-sm text-gray-400">3 dagen geleden</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-violet-500/50 hover:text-violet-300 transition-all duration-300" asChild>
                    <Link href="/documents">Bekijk</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}