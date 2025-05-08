"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SendCustomMessageProps {
  eventId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  registrationCount: number
}

export function SendCustomMessage({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  registrationCount,
}: SendCustomMessageProps) {
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Mensaje vacío",
        description: "Por favor, escribe un mensaje para enviar.",
        variant: "destructive",
      })
      return
    }

    if (registrationCount === 0) {
      toast({
        title: "No hay registros",
        description: "No hay participantes registrados para enviar mensajes.",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`¿Estás seguro de enviar este mensaje a ${registrationCount} participantes?`)) {
      return
    }

    setIsSending(true)

    try {
      const response = await fetch("/api/notifications/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "custom",
          eventId,
          customMessage: message,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Mensajes enviados",
          description: `Se han enviado mensajes a ${result.results.successful} participantes.`,
        })
        setMessage("")
        setIsOpen(false)
      } else {
        throw new Error(result.error || "Error al enviar mensajes")
      }
    } catch (error) {
      console.error("Error sending messages:", error)
      toast({
        title: "Error",
        description: `Error al enviar mensajes: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={registrationCount === 0}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Enviar mensaje
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar mensaje personalizado</DialogTitle>
          <DialogDescription>
            Este mensaje se enviará a todos los participantes registrados para el evento "{eventTitle}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Escribe tu mensaje aquí..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px]"
          />
          <p className="text-sm text-muted-foreground mt-2">
            El mensaje se enviará por WhatsApp (si hay número disponible) y por correo electrónico.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSendMessage} disabled={isSending || !message.trim()}>
            {isSending ? "Enviando..." : "Enviar mensaje"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
