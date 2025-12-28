"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export function TaxChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hallo! Ik ben je belastingondersteuning assistent. Stel gerust vragen over belastingregels, tips voor 2025, of optimalisatiestrategieën. Hoe kan ik je helpen?",
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading || limitReached) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

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
            description: data.message || "Maak een account aan en upgrade naar Premium voor onbeperkte AI aanroepen."
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
      toast.error("Er is een fout opgetreden. Probeer het opnieuw.")
      
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, er is een fout opgetreden bij het ophalen van een antwoord. Probeer het later opnieuw of stel je vraag anders.",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
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
    <Card className="w-full h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)] max-h-[800px] flex flex-col shadow-xl">
      <CardHeader className="border-b bg-card/95 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Belastingondersteuning Chatbot
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Limit reached alert */}
        {limitReached && (
          <div className="p-4 border-b">
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
                <Avatar className="h-8 w-8">
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
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">AI is bezig met het genereren van een reactie...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={limitReached ? "Upgrade naar Premium om verder te gaan..." : "Stel je vraag over belastingondersteuning..."}
              className="min-h-[60px] resize-none"
              disabled={isLoading || limitReached}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || limitReached}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!limitReached && (
            <p className="text-xs text-muted-foreground mt-2">
              Druk op Enter om te verzenden, Shift+Enter voor een nieuwe regel
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

