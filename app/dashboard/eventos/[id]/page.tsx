"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, Trash, AlertCircle, Copy, Check, Share2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { LocationDisplay } from "@/components/location-display"
import { useToast } from "@/components/ui/use-toast"

export default function EventoDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [registrationCount, setRegistrationCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setEvent(result.data)

          // Cargar conteo de registros
          const regResponse = await fetch(`/api/events/${params.id}/registrations`)
          if (regResponse.ok) {
            const regResult = await regResponse.json()
            if (regResult.success) {
              setRegistrationCount(regResult.data.totalRegistrations)
            }
          }
        } else {
          setError(result.error || "Error al cargar el evento")
        }
      } catch (error) {
        console.error("Error loading event:", error)
        setError(`Error al cargar el evento: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        router.push("/dashboard/eventos")
      } else {
        setError(result.error || "Error al eliminar el evento")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      setError(`Error al eliminar el evento: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const copyShareableLink = () => {
    if (event?.shareableSlug) {
      const url = `${window.location.origin}/eventos/${event.shareableSlug}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Función para guardar los cambios del evento
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError("")

    try {
      // Construir el objeto de datos del evento
      const eventData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        date: new Date(formData.get("date") as string),
        location: formData.get("location") as string,
        requiresPayment: formData.get("requiresPayment") === "on",
        price: formData.get("price") as string,
        stripeLink: formData.get("stripeLink") as string,
        isPublic: formData.get("isPublic") === "on",
        shareableSlug: formData.get("shareableSlug") as string,
        maxAttendees: formData.get("maxAttendees") ? Number.parseInt(formData.get("maxAttendees") as string) : null,
      }

      // Enviar la solicitud PUT a la API
      const response = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar el evento")
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Evento actualizado",
        description: "El evento ha sido actualizado correctamente.",
      })

      // Redirigir a la lista de eventos
      router.push("/dashboard/eventos")
    } catch (error) {
      console.error("Error updating event:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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

  const eventDate = new Date(event.date)
  const formattedTime = eventDate.toLocaleTimeString("es-PR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/eventos/${params.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {event.isPublic && event.shareableSlug && (
        <Alert>
          <Share2 className="h-4 w-4" />
          <AlertTitle>Evento público</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <p>Este evento está disponible para registro público. Comparte el siguiente enlace:</p>
            <div className="flex items-center space-x-2">
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                {`${window.location.origin}/eventos/${event.shareableSlug}`}
              </code>
              <Button variant="outline" size="sm" className="h-8 px-2" onClick={copyShareableLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="registrations">Registros ({registrationCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Evento</CardTitle>
              <CardDescription>Detalles completos del evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Título</h3>
                    <p className="text-lg">{event.title}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
                    <p className="text-base">{event.description || "Sin descripción"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Ubicación</h3>
                    <div className="text-base">
                      <LocationDisplay location={event.location} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Fecha</h3>
                      <p className="text-base">{formatDate(event.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Hora</h3>
                      <p className="text-base">{formattedTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Ubicación</h3>
                      <div className="text-base">
                        <LocationDisplay location={event.location} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Registros</h3>
                      <p className="text-base">
                        {registrationCount} {registrationCount === 1 ? "participante" : "participantes"}
                        {event.maxAttendees ? ` de ${event.maxAttendees} (máximo)` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Configuración</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Evento público</p>
                      <p className="text-sm text-muted-foreground">{event.isPublic ? "Sí" : "No"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Enlace compartible</p>
                      <p className="text-sm text-muted-foreground">
                        {event.shareableSlug ? "Activado" : "Desactivado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Registros</CardTitle>
              <CardDescription>Participantes registrados para este evento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button asChild>
                  <Link href={`/dashboard/eventos/${params.id}/registros`}>
                    <Users className="h-4 w-4 mr-2" />
                    Ver todos los registros
                  </Link>
                </Button>
              </div>

              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {registrationCount === 0
                    ? "No hay registros para este evento."
                    : `${registrationCount} ${registrationCount === 1 ? "participante registrado" : "participantes registrados"}.`}
                </p>
                {registrationCount === 0 && event.isPublic && event.shareableSlug && (
                  <p className="mt-2">Comparte el enlace público para que las personas puedan registrarse.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
