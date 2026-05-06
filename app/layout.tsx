import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SessionInitializer } from "@/components/session-initializer"
import { SplashScreen } from "@/components/splash-screen"
import { ErrorToastProvider } from "@/components/error-toast"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00d4ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e14" },
  ],
}

export const metadata: Metadata = {
  title: "Tradeo - Apprends le trading gratuitement",
  description:
    "Apprends le trading avec des leçons interactives et une simulation réaliste. Formation complète en trading, analyse technique, gestion du risque et psychologie du trader.",
  generator: "v0.app",
  applicationName: "Tradeo",
  keywords: ["trading", "bourse", "formation", "finance", "investissement", "CFD", "forex", "crypto"],
  authors: [{ name: "Tradeo" }],
  creator: "Tradeo",
  publisher: "Tradeo",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tradeo",
    startupImage: [
      {
        url: "/apple-icon.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://tradeo.app",
    title: "Tradeo - Apprends le trading gratuitement",
    description: "Apprends le trading avec des leçons interactives et une simulation réaliste",
    siteName: "Tradeo",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tradeo" />
      </head>
      <body className={`font-sans antialiased touch-manipulation`}>
        <ErrorToastProvider>
          <SplashScreen />
          <SessionInitializer />
          {children}
        </ErrorToastProvider>
      </body>
    </html>
  )
}
