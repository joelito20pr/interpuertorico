"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Download, Search, Users, Calendar, MapPin, Edit, RefreshCw } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { SendReminderButton } from "@/components/send-reminder-button"
import { SendCustomMessage } from "@/components/send-custom-message"
import { RegistrationEditor } from "@/components/registration-editor"

export default function RegistrosEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([])
  const [editingRegistration, setEditingRegistration] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      // Cargar información del evento
      const eventResponse = await fetch(`/api/events/${params.id}`)
      if (!eventResponse.ok) {
        throw new Error(`HTTP error! status: ${eventResponse.status}`)
      }
      const eventResult = await eventResponse.json()

      if (!eventResult.success) {
        throw new Error(eventResult.error || "Error al cargar el evento")
      }

      setEvent(eventResult.data)

      // Cargar registros del evento
      const registrationsResponse = await fetch(`/api/events/${params.id}/registrations`)
      if (!registrationsResponse.ok) {
        throw new Error(`HTTP error! status: ${registrationsResponse.status}`)
      }

      const registrationsResult = await registrationsResponse.json()

      if (!registrationsResult.success) {
        throw new Error(registrationsResult.error || "Error al cargar los registros")
      }

      setRegistrations(registrationsResult.data.registrations)
      setFilteredRegistrations(registrationsResult.data.registrations)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: `Error al cargar los datos: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [params.id, toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRegistrations(registrations)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = registrations.filter(
        (reg) =>
          reg.name.toLowerCase().includes(lowercasedSearch) ||
          (reg.guardianName && reg.guardianName.toLowerCase().includes(lowercasedSearch)) ||
          reg.email.toLowerCase().includes(lowercasedSearch) ||
          (reg.phone && reg.phone.toLowerCase().includes(lowercasedSearch)),
      )
      setFilteredRegistrations(filtered)
    }
  }, [searchTerm, registrations])

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      toast({
        title: "No hay datos para exportar",
        description: "No hay registros disponibles para exportar.",
        variant: "destructive",
      })
      return
    }

    // Crear contenido CSV
    const headers = [
      "Nombre Jugador",
      "Nombre Encargado",
      "Email",
      "Teléfono",
      "Cantidad",
      "Estado de Asistencia",
      "Fecha de Registro",
    ]
    const csvContent = [
      headers.join(","),
      ...registrations.map((reg) =>
        [
          `"${reg.name}"`,
          `"${reg.guardianName || ""}"`,
          `"${reg.email}"`,
          `"${reg.phone || ""}"`,
          reg.numberOfAttendees,
          reg.paymentStatus,
          formatDate(reg.createdAt),
        ].join(","),
      ),
    ].join("\n")

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `registros-${event?.title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para obtener el color y texto según el estado
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { color: "bg-green-100 text-green-800", text: "Confirmado" }
      case "DECLINED":
        return { color: "bg-red-100 text-red-800", text: "No asistirá" }
      case "PENDING":
      default:
        return { color: "bg-yellow-100 text-yellow-800", text: "Pendiente" }
    }
  }

  const handleEditRegistration = (registration: any) => {
    setEditingRegistration(registration)
  }

  const handleSaveRegistration = async (updatedRegistration: any) => {
    try {
      const response = await fetch(`/api/events/registrations/${updatedRegistration.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRegistration),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar el registro")
      }

      toast({
        title: "Registro actualizado",
        description: "La información del registro ha sido actualizada correctamente.",
      })

      // Actualizar la lista de registros
      setRegistrations((prevRegistrations) =>
        prevRegistrations.map((reg) => (reg.id === updatedRegistration.id ? updatedRegistration : reg)),
      )

      // Cerrar el editor
      setEditingRegistration(null)
    } catch (error) {
      console.error("Error updating registration:", error)
      toast({
        title: "Error",
        description: `Error al actualizar el registro: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadData()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No se encontró información del evento.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {editingRegistration ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setEditingRegistration(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Editar Registro</h1>
          </div>
          <RegistrationEditor
            registration={editingRegistration}
            onSave={handleSaveRegistration}
            onCancel={() => setEditingRegistration(null)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Registros del Evento</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <SendCustomMessage
                eventId={params.id}
                eventTitle={event.title}
                eventDate={event.date}
                eventLocation={event.location}
                registrationCount={registrations.length}
              />
              <SendReminderButton
                eventId={params.id}
                eventTitle={event.title}
                eventDate={event.date}
                eventLocation={event.location}
                registrationCount={registrations.length}
              />
              <Button variant="outline" onClick={handleExportCSV} disabled={registrations.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {registrations.length} {registrations.length === 1 ? "registro" : "registros"}
                      {event.maxAttendees ? ` de ${event.maxAttendees} disponibles` : ""}
                    </span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por nombre, email o teléfono..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredRegistrations.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  {registrations.length === 0
                    ? "No hay registros para este evento."
                    : "No se encontraron resultados para la búsqueda."}
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre Jugador</TableHead>
                        <TableHead>Nombre Encargado</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map((registration) => {
                        const statusInfo = getStatusInfo(registration.confirmationStatus || "PENDING")
                        return (
                          <TableRow key={registration.id}>
                            <TableCell className="font-medium">{registration.name}</TableCell>
                            <TableCell>{registration.guardianName || "-"}</TableCell>
                            <TableCell>{registration.email}</TableCell>
                            <TableCell>{registration.phone || "-"}</TableCell>
                            <TableCell className="text-center">{registration.numberOfAttendees || 1}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
                              >
                                {statusInfo.text}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(registration.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRegistration(registration)}
                                title="Editar registro"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
