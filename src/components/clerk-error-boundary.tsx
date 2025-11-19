"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ErrorBoundaryState {
  hasError: boolean
}

export class ClerkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check of het een Clerk error is
    if (error.message?.includes("ClerkProvider") || error.message?.includes("useUser")) {
      return { hasError: true }
    }
    // Re-throw andere errors
    throw error
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("Clerk error caught:", error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/signin">Inloggen</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Start gratis</Link>
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

