"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { WhatsAppLinksDisplay } from "./whatsapp-links-display"

interface SendReminderButtonProps {
  eventId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
}

export function SendReminderButton({ eventId, eventTitle, eventDate, eventLocation }: SendReminderButtonProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [whatsappLinks, setWhatsappLinks] = useState<any[]>([])

  const sendReminders = async () => {
    if (!confirm("¿Estás seguro de que deseas enviar recordatorios a todos los participantes?")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/notifications/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "reminder",
          eventId,
          eventTitle,
          eventDate,
          eventLocation,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Recordatorios enviados",
          description: `Se enviaron ${data.results.successful} de ${data.results.total} recordatorios correctamente.`,
        })

        // Si hay enlaces de WhatsApp, mostrarlos
        if (data.results.whatsappLinks && data.results.whatsappLinks.length > 0) {
          setWhatsappLinks(data.results.whatsappLinks)
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudieron enviar los recordatorios.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending reminders:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar los recordatorios.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={sendReminders} disabled={loading} className="ml-auto">
        <Bell className="mr-2 h-4 w-4" />
        {loading ? "Enviando..." : "Enviar recordatorios"}
      </Button>

      {whatsappLinks.length > 0 && <WhatsAppLinksDisplay links={whatsappLinks} onClose={() => setWhatsappLinks([])} />}
    </>
  )
}
