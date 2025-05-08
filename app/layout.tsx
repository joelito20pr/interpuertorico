import type React from "react"
import "./globals.css"

export const metadata = {
  title: "Inter Puerto Rico Futsal",
  description: "Plataforma de gestión para Inter Puerto Rico Futsal",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
