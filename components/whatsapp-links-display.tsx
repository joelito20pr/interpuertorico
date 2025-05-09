"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clipboard, Check, Share2, X } from "lucide-react"

interface WhatsAppLink {
  name: string
  phone: string
  link: string
}

interface WhatsAppLinksDisplayProps {
  links: WhatsAppLink[]
  title?: string
  description?: string
  onClose?: () => void
}

export function WhatsAppLinksDisplay({
  links,
  title = "Enlaces de WhatsApp",
  description = "Envía mensajes a los participantes a través de WhatsApp",
  onClose,
}: WhatsAppLinksDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const shareLink = async (link: string, name: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mensaje para ${name}`,
          text: `Mensaje de WhatsApp para ${name}`,
          url: link,
        })
      } catch (error) {
        console.error("Error sharing:", error)
        // Fallback to opening in new tab
        window.open(link, "_blank")
      }
    } else {
      // If Web Share API is not available, open in new tab
      window.open(link, "_blank")
    }
  }

  if (!links || links.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {links.map((link, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{link.name}</p>
                <p className="text-sm text-gray-500">{link.phone}</p>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.link, index)}>
                  {copiedIndex === index ? <Check className="h-4 w-4 mr-1" /> : <Clipboard className="h-4 w-4 mr-1" />}
                  {copiedIndex === index ? "Copiado" : "Copiar"}
                </Button>
                <Button variant="default" size="sm" onClick={() => shareLink(link.link, link.name)}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Abrir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
