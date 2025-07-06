import "@/styles/globals.css"
import { Metadata } from "next"
import { GlobalProvider } from "@/context/GlobalProvider"
import { ThemeProvider } from "@/context/ThemeProvider"
import { Toaster } from "sonner"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils/utils"
import { Navbar } from "@/components/navbar/Navbar"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
        </head>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <GlobalProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <Toaster />
                <div className="flex-1">{children}</div>
              </div>
            </GlobalProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
