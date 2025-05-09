"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send } from "lucide-react"

interface SendIndividualMessageProps {
  eventId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  recipient: any
  onSuccess?: () => void
}

export function SendIndividualMessage({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  recipient,
  onSuccess,
}: SendIndividualMessageProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState(`Mensaje personal: ${eventTitle}`)
  const [sendVia, setSendVia] = useState<"email" | "whatsapp" | "both">("both")

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Mensaje vacío",
        description: "Por favor, escribe un mensaje para enviar.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const response = await fetch("/api/notifications/send-selected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "custom",
          eventId,
          customMessage: message,
          subject,
          recipientIds: [recipient.id],
          sendVia,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Mensaje enviado",
          description: `Se ha enviado el mensaje a ${recipient.guardianName || recipient.name}.`,
        })
        setMessage("")
        setIsOpen(false)
        if (onSuccess) onSuccess()
      } else {
        throw new Error(result.error || "Error al enviar el mensaje")
      }
    } catch (error) {
      console.error("Error sending individual message:", error)
      toast({
        title: "Error",
        description: `Error al enviar el mensaje: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Enviar mensaje">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar mensaje individual</DialogTitle>
          <DialogDescription>
            Envía un mensaje personalizado a {recipient.guardianName || recipient.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-md space-y-2">
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-sm font-medium">Destinatario:</span>
              <span className="text-sm">{recipient.guardianName || recipient.name}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-sm font-medium">Jugador:</span>
              <span className="text-sm">{recipient.name}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-1">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{recipient.email}</span>
            </div>
            {recipient.phone && (
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <span className="text-sm font-medium">Teléfono:</span>
                <span className="text-sm">{recipient.phone}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Asunto del correo
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del correo electrónico"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Mensaje
            </label>
            <Textarea
              id="message"
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Enviar vía</label>
            <Select value={sendVia} onValueChange={(value) => setSendVia(value as "email" | "whatsapp" | "both")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método de envío" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Solo correo electrónico</SelectItem>
                {recipient.phone && <SelectItem value="whatsapp">Solo WhatsApp</SelectItem>}
                {recipient.phone && <SelectItem value="both">Ambos (correo y WhatsApp)</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSendMessage} disabled={isSending || !message.trim()}>
            {isSending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar mensaje
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
