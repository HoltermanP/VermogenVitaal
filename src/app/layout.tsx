import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamicImport from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { FinnChatbotWrapper } from "@/components/finn-chatbot-wrapper";
import { Suspense } from "react";
import { AuthModalHandler } from "@/components/auth-modal-handler";
import { PageContentGuard } from "@/components/page-content-guard";

// Dynamisch importeren van Header om Clerk hooks te vermijden tijdens static generation
const Header = dynamicImport(() => import("@/components/header").then(mod => ({ default: mod.Header })), {
  ssr: true, // We willen SSR, maar met error handling
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "aivermogen.nl - Fiscale Optimalisatie voor Ondernemers",
  description: "De complete oplossing voor belastingondersteuning en vermogensopbouw voor Nederlandse ondernemers",
};

// Force dynamic rendering for all pages to handle Clerk authentication properly
export const forceDynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning className="dim">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dim"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Header />
            <Suspense fallback={null}>
              <PageContentGuard>
                {children}
              </PageContentGuard>
            </Suspense>
            <Suspense fallback={null}>
              <AuthModalHandler />
            </Suspense>
            <FinnChatbotWrapper />
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
