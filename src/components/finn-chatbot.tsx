"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, AlertCircle, MessageCircle, X, LogIn } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useUser } from "@clerk/nextjs"
import { SignInDialog } from "./auth-dialog"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export function FinnChatbot() {
  // Clerk hooks gebruiken - component wordt alleen gerenderd als Clerk beschikbaar is
  const { user, isLoaded } = useUser()
  const isAuthenticated = !!user
  const [isOpen, setIsOpen] = useState(false)
  const [signInDialogOpen, setSignInDialogOpen] = useState(false)
  
  // Initialiseer messages met aangepaste welcome message
  const getInitialMessage = () => {
    if (!isLoaded) {
      return "Hallo! Ik ben Finn, je AI-assistent voor financiële en belastinginformatie..."
    }
    if (!isAuthenticated) {
      return "Hallo! Ik ben Finn, je AI-assistent voor financiële en belastinginformatie. Log in om te beginnen met chatten en persoonlijke informatie te krijgen over belastingen, financiën, investeringen en meer."
    }
    return "Hallo! Ik ben Finn, je AI-assistent voor financiële en belastinginformatie. Ik kan je helpen met vragen over belastingen, financiën, investeringen en meer. Hoe kan ik je helpen?"
  }
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getInitialMessage(),
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  // Update welcome message wanneer authenticatie status verandert
  useEffect(() => {
    if (isLoaded) {
      const newWelcomeMessage = !isAuthenticated
        ? "Hallo! Ik ben Finn, je AI-assistent voor financiële en belastinginformatie. Log in om te beginnen met chatten en persoonlijke informatie te krijgen over belastingen, financiën, investeringen en meer."
        : "Hallo! Ik ben Finn, je AI-assistent voor financiële en belastinginformatie. Ik kan je helpen met vragen over belastingen, financiën, investeringen en meer. Hoe kan ik je helpen?"

      setMessages(prev => {
        // Alleen updaten als we nog maar 1 bericht hebben (welkomstbericht)
        if (prev.length === 1 && prev[0].content !== newWelcomeMessage) {
          return [{
            role: "assistant",
            content: newWelcomeMessage,
            timestamp: new Date().toISOString()
          }]
        }
        return prev
      })
    }
  }, [isAuthenticated, isLoaded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading || limitReached) return

    // Anonieme gebruikers kunnen nu ook de chatbot gebruiken (met limiet)

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setNeedsAuth(false)

    try {
      // Bouw conversation history op (laatste 10 berichten voor context)
      const conversationHistory = messages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      const response = await fetch("/api/tips/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check of het een limiet error is
        if (response.status === 403 && data.error === "AI_LIMIT_REACHED") {
          setLimitReached(true)
          const errorMessage: Message = {
            role: "assistant",
            content: data.message || "Je hebt je limiet van 10 gratis AI aanroepen bereikt. Maak een account aan en upgrade naar Premium voor onbeperkte AI aanroepen.",
            timestamp: new Date().toISOString()
          }
          setMessages(prev => [...prev, errorMessage])
          toast.error("Limiet bereikt", {
            description: isAuthenticated 
              ? "Upgrade naar Premium voor onbeperkte AI aanroepen."
              : "Maak een account aan en upgrade naar Premium voor onbeperkte AI aanroepen."
          })
          return
        }
        
        // Check of het een authenticatie error is (voor andere endpoints die dit nog vereisen)
        if (response.status === 401) {
          setNeedsAuth(true)
          const errorMessage: Message = {
            role: "assistant",
            content: data.message || "Er is een authenticatie probleem opgetreden.",
            timestamp: new Date().toISOString()
          }
          setMessages(prev => [...prev, errorMessage])
          toast.error("Authenticatie fout", {
            description: data.message || "Probeer opnieuw in te loggen."
          })
          return
        }
        
        throw new Error(data.error || "Fout bij het ophalen van antwoord")
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: data.timestamp || new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage = error instanceof Error ? error.message : "Er is een fout opgetreden"
      
      if (errorMessage.includes("Niet geautoriseerd") || errorMessage.includes("401")) {
        setNeedsAuth(true)
        toast.error("Inloggen vereist", {
          description: "Log in om Finn te gebruiken."
        })
      } else {
        toast.error("Er is een fout opgetreden. Probeer het opnieuw.")
      }
      
      const assistantErrorMessage: Message = {
        role: "assistant",
        content: errorMessage.includes("Niet geautoriseerd") || errorMessage.includes("401")
          ? "Je moet ingelogd zijn om Finn te gebruiken. Gebruik de inlogknop bovenaan het chatvenster om in te loggen."
          : "Sorry, er is een fout opgetreden bij het ophalen van een antwoord. Probeer het later opnieuw of stel je vraag anders.",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantErrorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open Finn chatbot"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></span>
          </div>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-popover text-popover-foreground rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm border">
            Praat met Finn
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] md:w-[420px] h-[600px] flex flex-col shadow-2xl rounded-lg overflow-hidden border bg-background animate-in slide-in-from-bottom-5">
          <Card className="h-full flex flex-col border-0 shadow-none">
            <CardHeader className="border-b bg-card/95 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="relative">
                    <Bot className="h-5 w-5 text-primary" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full border border-background"></span>
                  </div>
                  Finn
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                  aria-label="Sluit chatbot"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Authentication required alert */}
              {needsAuth && !isAuthenticated && (
                <div className="p-4 border-b flex-shrink-0 bg-muted/50">
                  <Alert>
                    <LogIn className="h-4 w-4" />
                    <AlertTitle>Inloggen vereist</AlertTitle>
                    <AlertDescription className="mt-2">
                      Je moet ingelogd zijn om Finn te gebruiken. Log in om te beginnen met chatten.
                      <Button
                        className="mt-3 w-full"
                        size="sm"
                        onClick={() => setSignInDialogOpen(true)}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Inloggen
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Limit reached alert */}
              {limitReached && (
                <div className="p-4 border-b flex-shrink-0">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Limiet bereikt</AlertTitle>
                    <AlertDescription className="mt-2">
                      Je hebt je limiet van 10 gratis AI aanroepen bereikt. Upgrade naar Premium voor onbeperkte AI aanroepen.
                      <Link href="/pricing">
                        <Button className="mt-3 w-full" size="sm">
                          Upgrade naar Premium
                        </Button>
                      </Link>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <form onSubmit={handleSubmit} className="border-t p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      !isAuthenticated 
                        ? "Log in om een vraag te stellen..." 
                        : limitReached 
                        ? "Upgrade naar Premium om verder te gaan..." 
                        : "Stel je vraag..."
                    }
                    className="min-h-[60px] resize-none"
                    disabled={isLoading || limitReached || !isAuthenticated}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading || limitReached || !isAuthenticated}
                    className="self-end"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {!limitReached && isAuthenticated && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Druk op Enter om te verzenden, Shift+Enter voor een nieuwe regel
                  </p>
                )}
                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setSignInDialogOpen(true)}
                    >
                      Log in
                    </button>
                    {" "}om Finn te gebruiken
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sign In Dialog */}
      <SignInDialog 
        open={signInDialogOpen} 
        onOpenChange={setSignInDialogOpen}
        showTrigger={false}
      />
    </>
  )
}

