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
import { MessageSquare, Users, User, Mail, Send, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

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
  initialMode?: "group" | "individual"
  preSelectedRecipients?: string[]
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
  initialMode = "group",
  preSelectedRecipients = [],
}: MessageSenderProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState(`Información importante: ${eventTitle}`)
  const [messageType, setMessageType] = useState<"group" | "individual">(initialMode)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(preSelectedRecipients)
  const [sendVia, setSendVia] = useState<"email" | "whatsapp" | "both">("both")
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)
  const [allRegistrations, setAllRegistrations] = useState<any[]>(registrations || [])
  const [recipientSearchTerm, setRecipientSearchTerm] = useState("")
  const [filteredRecipients, setFilteredRecipients] = useState<any[]>([])

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

  // Filtrar destinatarios según el término de búsqueda
  useEffect(() => {
    if (recipientSearchTerm.trim() === "") {
      setFilteredRecipients(allRegistrations)
    } else {
      const lowercasedSearch = recipientSearchTerm.toLowerCase()
      const filtered = allRegistrations.filter(
        (reg) =>
          reg.name.toLowerCase().includes(lowercasedSearch) ||
          (reg.guardianName && reg.guardianName.toLowerCase().includes(lowercasedSearch)) ||
          reg.email.toLowerCase().includes(lowercasedSearch) ||
          (reg.phone && reg.phone.toLowerCase().includes(lowercasedSearch)),
      )
      setFilteredRecipients(filtered)
    }
  }, [recipientSearchTerm, allRegistrations])

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredRecipients.length) {
      setSelectedRecipients([])
    } else {
      setSelectedRecipients(filteredRecipients.map((reg) => reg.id))
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

  // Obtener nombres de los destinatarios seleccionados
  const getSelectedRecipientsNames = () => {
    return allRegistrations
      .filter((reg) => selectedRecipients.includes(reg.id))
      .map((reg) => reg.guardianName || reg.name)
      .join(", ")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={allRegistrations.length === 0}>
          {messageType === "group" ? (
            <>
              <Users className="h-4 w-4 mr-2" />
              Mensaje grupal
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Mensaje individual
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enviar mensaje</DialogTitle>
          <DialogDescription>
            Envía un mensaje a los participantes registrados para el evento "{eventTitle}".
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={initialMode} onValueChange={(value) => setMessageType(value as "group" | "individual")}>
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
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                Este mensaje se enviará a todos los participantes registrados ({allRegistrations.length}).
              </p>
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Seleccionar destinatarios</h4>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="ml-2">
                    {selectedRecipients.length} seleccionados
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedRecipients.length === filteredRecipients.length
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </Button>
                </div>
              </div>

              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar destinatarios..."
                  className="pl-8"
                  value={recipientSearchTerm}
                  onChange={(e) => setRecipientSearchTerm(e.target.value)}
                />
              </div>

              {isLoadingRegistrations ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                  {filteredRecipients.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      {allRegistrations.length === 0
                        ? "No hay participantes registrados."
                        : "No se encontraron resultados para la búsqueda."}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredRecipients.map((registration) => (
                        <div
                          key={registration.id}
                          className="flex items-center space-x-2 p-1 hover:bg-muted rounded-md"
                        >
                          <Checkbox
                            id={`recipient-${registration.id}`}
                            checked={selectedRecipients.includes(registration.id)}
                            onCheckedChange={() => handleRecipientToggle(registration.id)}
                          />
                          <label
                            htmlFor={`recipient-${registration.id}`}
                            className="text-sm flex-1 cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <span className="font-medium">{registration.name}</span>
                              {registration.guardianName && (
                                <span className="text-muted-foreground ml-1">({registration.guardianName})</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              {registration.email && <Mail className="h-3 w-3" title={registration.email} />}
                              {registration.phone && <MessageSquare className="h-3 w-3" title={registration.phone} />}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedRecipients.length > 0 && (
                <div className="bg-muted p-2 rounded-md text-xs">
                  <strong>Destinatarios seleccionados:</strong> {getSelectedRecipientsNames()}
                </div>
              )}
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
