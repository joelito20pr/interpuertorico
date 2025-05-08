"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clipboard, Check, X } from "lucide-react"

interface WhatsAppLink {
  name: string
  phone: string
  link: string
}

interface WhatsAppLinksDisplayProps {
  links: WhatsAppLink[]
  onClose: () => void
}

export function WhatsAppLinksDisplay({ links, onClose }: WhatsAppLinksDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!links || links.length === 0) {
    return null
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Enlaces de WhatsApp</CardTitle>
          <CardDescription>
            Haz clic en cada enlace para abrir WhatsApp y enviar el mensaje, o copia el enlace para compartirlo.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex-1 mr-2">
                <p className="font-medium">{link.name}</p>
                <p className="text-sm text-muted-foreground">{link.phone}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm">
                  <a href={link.link} target="_blank" rel="noopener noreferrer">
                    Abrir WhatsApp
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(link.link, index)}
                  title="Copiar enlace"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
