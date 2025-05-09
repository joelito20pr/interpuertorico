"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { Mail, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

interface SendConfirmationEmailProps {
  registration: {
    id: string
    name: string
    email: string
    guardianName?: string
    phone?: string
    confirmationStatus?: string
  }
  event: {
    id: string
    title: string
    date: string | Date
    location: string
  }
  onSuccess?: () => void
}

export function SendConfirmationEmail({ registration, event, onSuccess }: SendConfirmationEmailProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [subject, setSubject] = useState(`Confirmación de asistencia: ${event.title}`)
  const [message, setMessage] = useState(
    `Hola ${registration.guardianName || registration.name},

Queremos confirmar tu asistencia al evento "${event.title}" que se realizará el ${formatDate(
      event.date,
    )} en ${event.location}.

Por favor, haz clic en uno de los botones a continuación para confirmar o declinar tu asistencia.

Gracias,
Equipo de Inter Puerto Rico FC`,
  )

  const { toast } = useToast()

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/send-confirmation-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: registration.id,
          eventId: event.id,
          subject,
          message,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Error al enviar el correo de confirmación")
      }

      toast({
        title: "Correo enviado",
        description: "El correo de confirmación ha sido enviado correctamente",
      })

      setIsOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error sending confirmation email:", error)
      toast({
        title: "Error",
        description: `Error al enviar el correo: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Enviar correo de confirmación">
          <Mail className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar correo de confirmación</DialogTitle>
          <DialogDescription>
            Envía un correo electrónico a {registration.name} para confirmar su asistencia al evento.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient">Destinatario</Label>
            <Input id="recipient" value={`${registration.name} <${registration.email}>`} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar correo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
