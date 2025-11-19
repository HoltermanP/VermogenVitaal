"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plug,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
} from "lucide-react"
import { PROVIDER_INFO } from "@/lib/accounting/provider-factory"
import { toast } from "sonner"
import { NewsTicker } from "@/components/news-ticker"

interface Integration {
  id: string
  provider: string
  name: string
  companyId: string | null
  isActive: boolean
  lastSyncAt: string | null
  createdAt: string
  updatedAt: string
}

export default function AccountingPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  const [apiKeyProvider, setApiKeyProvider] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [connectionName, setConnectionName] = useState("")

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await fetch("/api/accounting/integrations")
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.integrations || [])
      }
    } catch (error) {
      console.error("Error loading integrations:", error)
      toast.error("Kon integraties niet laden")
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (provider: string) => {
    const providerInfo = PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO]
    
    // Als het een API key provider is, toon dialog
    if (providerInfo?.authType === "api_key") {
      setApiKeyProvider(provider)
      setApiKeyDialogOpen(true)
      return
    }

    // Anders, gebruik OAuth flow
    setConnecting(provider)
    try {
      const response = await fetch("/api/accounting/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          returnUrl: window.location.href,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect naar OAuth provider
        window.location.href = data.authUrl
      } else {
        const error = await response.json()
        toast.error(error.error || "Kon niet verbinden")
      }
    } catch (error) {
      console.error("Connect error:", error)
      toast.error("Fout bij verbinden")
    } finally {
      setConnecting(null)
    }
  }

  const handleApiKeyConnect = async () => {
    if (!apiKeyProvider || !apiKey) {
      toast.error("API key is vereist")
      return
    }
    
    // Voor e-Boekhouden REST API: geen secret nodig (alleen Bearer token)
    // Voor andere providers kan een secret nodig zijn
    const finalApiSecret = apiKeyProvider === "E_BOEKHOUDEN" ? null : apiSecret
    
    if (!finalApiSecret && apiKeyProvider !== "E_BOEKHOUDEN") {
      toast.error("API secret is vereist voor deze provider")
      return
    }

    setConnecting(apiKeyProvider)
    try {
      const response = await fetch("/api/accounting/connect-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: apiKeyProvider,
          apiKey,
          apiSecret: finalApiSecret,
          name: connectionName || undefined,
        }),
      })

      if (response.ok) {
        toast.success("Koppeling succesvol!")
        setApiKeyDialogOpen(false)
        setApiKey("")
        setApiSecret("")
        setConnectionName("")
        setApiKeyProvider(null)
        await loadIntegrations()
      } else {
        const error = await response.json()
        toast.error(error.error || "Kon niet verbinden")
      }
    } catch (error) {
      console.error("Connect API key error:", error)
      toast.error("Fout bij verbinden")
    } finally {
      setConnecting(null)
    }
  }

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId)
    try {
      const response = await fetch("/api/accounting/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrationId,
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`${data.count} transacties gesynchroniseerd`)
        await loadIntegrations()
      } else {
        const error = await response.json()
        toast.error(error.error || "Synchronisatie mislukt")
      }
    } catch (error) {
      console.error("Sync error:", error)
      toast.error("Fout bij synchroniseren")
    } finally {
      setSyncing(null)
    }
  }

  const handleDelete = async (integrationId: string) => {
    if (!confirm("Weet je zeker dat je deze koppeling wilt verwijderen?")) {
      return
    }

    try {
      const response = await fetch(
        `/api/accounting/integrations?id=${integrationId}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        toast.success("Koppeling verwijderd")
        await loadIntegrations()
      } else {
        const error = await response.json()
        toast.error(error.error || "Verwijderen mislukt")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Fout bij verwijderen")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nog niet gesynchroniseerd"
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Financial grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 animate-fade-in">
            <span className="text-gradient-financial">Boekhoudpakket Koppelingen</span>
          </h1>
          <p className="text-muted-foreground text-lg animate-fade-in delay-200">
            Koppel je boekhoudpakket om automatisch transacties op te halen
          </p>
        </div>

        {/* News Ticker - Compact */}
        <div className="mb-6">
          <NewsTicker pagePath="/accounting" />
        </div>

        {/* Actieve Koppelingen */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6 animate-fade-in delay-300">
            Actieve Koppelingen
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-32 bg-card/50"
                />
              ))}
            </div>
          ) : integrations.length > 0 ? (
            <div className="space-y-4">
              {integrations.map((integration) => {
                const providerInfo =
                  PROVIDER_INFO[
                    integration.provider as keyof typeof PROVIDER_INFO
                  ]
                return (
                  <Card
                    key={integration.id}
                    className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 animate-fade-in delay-300"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 gradient-financial rounded-xl flex items-center justify-center shadow-financial">
                            <Plug className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-foreground">
                              {integration.name}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {providerInfo?.name || integration.provider}
                              {integration.companyId &&
                                ` • Company ID: ${integration.companyId}`}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            integration.isActive ? "default" : "secondary"
                          }
                          className={integration.isActive ? "gradient-financial text-white shadow-financial" : "bg-muted text-muted-foreground"}
                        >
                          {integration.isActive ? "Actief" : "Inactief"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Laatste sync: {formatDate(integration.lastSyncAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(integration.id)}
                            disabled={syncing === integration.id}
                            className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                          >
                            {syncing === integration.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Synchroniseren...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Synchroniseren
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(integration.id)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Verwijderen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground mb-6">
                  Je hebt nog geen boekhoudpakket gekoppeld
                </p>
                <p className="text-sm text-muted-foreground">
                  Koppel een boekhoudpakket hieronder om te beginnen
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Beschikbare Koppelingen */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6 animate-fade-in delay-400">
            Beschikbare Koppelingen
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(PROVIDER_INFO).map(([key, info], index) => {
              const isConnected = integrations.some(
                (i) => i.provider === key
              )
              const isConnecting = connecting === key

              return (
                <Card
                  key={key}
                  className="bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-financial-lg hover:border-primary/50 transition-all duration-500 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${(index % 6) * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">{info.logo}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-foreground">
                          {info.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {info.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {isConnected ? (
                        <Badge className="gradient-financial text-white shadow-financial">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Gekoppeld
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(key)}
                          disabled={isConnecting}
                          className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
                        >
                          {isConnecting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Verbinden...
                            </>
                          ) : (
                            <>
                              <Plug className="h-4 w-4 mr-2" />
                              Koppelen
                            </>
                          )}
                        </Button>
                      )}
                      {info.authType === "oauth" && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Koppel {apiKeyProvider && PROVIDER_INFO[apiKeyProvider as keyof typeof PROVIDER_INFO]?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Voer je API credentials in om te koppelen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Naam (optioneel)
              </Label>
              <Input
                id="name"
                placeholder="Bijv. Mijn e-Boekhouden"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-foreground">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Je API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            {apiKeyProvider !== "E_BOEKHOUDEN" && (
              <div className="space-y-2">
                <Label htmlFor="apiSecret" className="text-foreground">
                  API Secret
                </Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="Je API secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApiKeyDialogOpen(false)
                setApiKey("")
                setApiSecret("")
                setConnectionName("")
              }}
              className="border-primary/50 hover:bg-primary/10 hover:border-primary"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleApiKeyConnect}
              disabled={!apiKey || connecting === apiKeyProvider}
              className="gradient-financial text-white shadow-financial hover:shadow-financial-lg transition-all duration-300"
            >
              {connecting === apiKeyProvider ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verbinden...
                </>
              ) : (
                "Koppelen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

