import type React from "react"
import "./globals.css"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Liam Pierce",
  description: "Director / Editor / Cinematographer",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn("bg-black text-white antialiased font-sans")}>{children}</body>
    </html>
  )
}



import './globals.css'