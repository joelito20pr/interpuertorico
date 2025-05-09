"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Users, User, Mail, Send } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MessageSenderProps {
  eventId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  registrations?: any[]
  onSuccess?: () => void
  variant?: "outline" | "default" | "secondary" | "destructive" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function MessageSender({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  registrations = [],
  onSuccess,
  variant = "outline",
  size = "default",
  className = "",
}: MessageSenderProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState(`Información importante: ${eventTitle}`)
  const [messageType, setMessageType] = useState<"group" | "individual">("group")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [sendVia, setSendVia] = useState<"email" | "whatsapp" | "both">("both")
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)
  const [allRegistrations, setAllRegistrations] = useState<any[]>(registrations || [])

  // Cargar registros si no se proporcionan
  useEffect(() => {
    if (registrations && registrations.length > 0) {
      setAllRegistrations(registrations)
      return
    }

    const loadRegistrations = async () => {
      try {
        setIsLoadingRegistrations(true)
        const response = await fetch(`/api/events/${eventId}/registrations`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.success && data.data.registrations) {
          setAllRegistrations(data.data.registrations)
        }
      } catch (error) {
        console.error("Error loading registrations:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los registros. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingRegistrations(false)
      }
    }

    if (eventId) {
      loadRegistrations()
    }
  }, [eventId, registrations, toast])

  const handleSelectAll = () => {
    if (selectedRecipients.length === allRegistrations.length) {
      setSelectedRecipients([])
    } else {
      setSelectedRecipients(allRegistrations.map((reg) => reg.id))
    }
  }

  const handleRecipientToggle = (id: string) => {
    if (selectedRecipients.includes(id)) {
      setSelectedRecipients(selectedRecipients.filter((r) => r !== id))
    } else {
      setSelectedRecipients([...selectedRecipients, id])
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Mensaje vacío",
        description: "Por favor, escribe un mensaje para enviar.",
        variant: "destructive",
      })
      return
    }

    if (messageType === "individual" && selectedRecipients.length === 0) {
      toast({
        title: "Sin destinatarios",
        description: "Por favor, selecciona al menos un destinatario.",
        variant: "destructive",
      })
      return
    }

    if (
      messageType === "group" &&
      !confirm(`¿Estás seguro de enviar este mensaje a todos los participantes (${allRegistrations.length})?`)
    ) {
      return
    }

    setIsSending(true)

    try {
      let endpoint = ""
      let payload = {}

      if (messageType === "group") {
        endpoint = "/api/notifications/send-bulk"
        payload = {
          type: "custom",
          eventId,
          customMessage: message,
          subject,
          sendVia,
        }
      } else {
        endpoint = "/api/notifications/send-selected"
        payload = {
          type: "custom",
          eventId,
          customMessage: message,
          subject,
          recipientIds: selectedRecipients,
          sendVia,
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Mensajes enviados",
          description: `Se han enviado mensajes a ${
            messageType === "group" ? "todos los participantes" : `${selectedRecipients.length} participantes`
          }.`,
        })
        setMessage("")
        setIsOpen(false)
        if (onSuccess) onSuccess()
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
        <Button variant={variant} size={size} className={className} disabled={allRegistrations.length === 0}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Enviar mensaje
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enviar mensaje</DialogTitle>
          <DialogDescription>
            Envía un mensaje a los participantes registrados para el evento "{eventTitle}".
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="group" onValueChange={(value) => setMessageType(value as "group" | "individual")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="group">
              <Users className="h-4 w-4 mr-2" />
              Mensaje grupal
            </TabsTrigger>
            <TabsTrigger value="individual">
              <User className="h-4 w-4 mr-2" />
              Mensaje individual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="group" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Este mensaje se enviará a todos los participantes registrados ({allRegistrations.length}).
            </p>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Seleccionar destinatarios</h4>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedRecipients.length === allRegistrations.length ? "Deseleccionar todos" : "Seleccionar todos"}
                </Button>
              </div>

              {isLoadingRegistrations ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                  {allRegistrations.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No hay participantes registrados.</p>
                  ) : (
                    <div className="space-y-2">
                      {allRegistrations.map((registration) => (
                        <div key={registration.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`recipient-${registration.id}`}
                            checked={selectedRecipients.includes(registration.id)}
                            onCheckedChange={() => handleRecipientToggle(registration.id)}
                          />
                          <label
                            htmlFor={`recipient-${registration.id}`}
                            className="text-sm flex-1 cursor-pointer flex items-center justify-between"
                          >
                            <span>
                              {registration.name}
                              {registration.guardianName ? ` (${registration.guardianName})` : ""}
                            </span>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              {registration.email && <Mail className="h-3 w-3" />}
                              {registration.phone && <MessageSquare className="h-3 w-3" />}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Seleccionados: {selectedRecipients.length} de {allRegistrations.length}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 py-4">
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
                <SelectItem value="whatsapp">Solo WhatsApp</SelectItem>
                <SelectItem value="both">Ambos (correo y WhatsApp)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
            <p>
              <strong>Nota:</strong> El mensaje se enviará por correo electrónico a todos los participantes. Los
              mensajes de WhatsApp solo se enviarán a aquellos que hayan proporcionado un número de teléfono.
            </p>
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
