"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash,
  AlertCircle,
  Copy,
  Check,
  Share2,
  RefreshCw,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { LocationDisplay } from "@/components/location-display"
import { useToast } from "@/components/ui/use-toast"

export default function EventoDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [registrationCount, setRegistrationCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [responseDetails, setResponseDetails] = useState<string | null>(null)

  const loadEvent = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setResponseDetails(null)
      console.log(`Loading event with ID: ${params.id}`)

      const response = await fetch(`/api/events/${params.id}`)

      // Store the status for debugging
      const status = response.status
      const statusText = response.statusText

      // Try to parse the response as JSON
      let responseBody = null
      try {
        responseBody = await response.json()
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
      }

      // Set detailed response info for debugging
      setResponseDetails(`Status: ${status} ${statusText}
Response: ${responseBody ? JSON.stringify(responseBody, null, 2) : "No JSON response"}`)

      if (status === 404) {
        setError(
          `Evento no encontrado (ID: ${params.id}). Es posible que haya sido eliminado o que la URL sea incorrecta.`,
        )
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${status}`)
      }

      if (responseBody && responseBody.success) {
        setEvent(responseBody.data)

        // Cargar conteo de registros
        try {
          const regResponse = await fetch(`/api/events/${params.id}/registrations`)
          if (regResponse.ok) {
            const regResult = await regResponse.json()
            if (regResult.success) {
              setRegistrationCount(regResult.data.totalRegistrations)
            }
          }
        } catch (regError) {
          console.error("Error loading registrations:", regError)
          // Don't set an error for this, just log it
        }
      } else {
        setError(responseBody?.error || "Error al cargar el evento")
      }
    } catch (error) {
      console.error("Error loading event:", error)
      setError(`Error al cargar el evento: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadEvent()
  }, [params.id])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadEvent()
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setIsDeleting(true)
      console.log(`Deleting event with ID: ${params.id}`)

      const response = await fetch(`/api/events/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP error! status: ${response.status}. ${errorData.error || ""}`)
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Evento eliminado",
          description: "El evento ha sido eliminado correctamente.",
        })
        router.push("/dashboard/eventos")
      } else {
        setError(result.error || "Error al eliminar el evento")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      setError(`Error al eliminar el evento: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const copyShareableLink = () => {
    if (event?.shareableSlug) {
      // Usar el dominio correcto para el enlace compartible
      const url = `https://www.interprfc.com/eventos/${event.shareableSlug}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles.",
      })
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

        <Card>
          <CardHeader>
            <CardTitle>Opciones de diagnóstico</CardTitle>
            <CardDescription>Herramientas para solucionar problemas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Intentar de nuevo
                  </>
                )}
              </Button>

              <Button variant="outline" asChild>
                <Link href="/api/debug/list-events">Ver todos los eventos</Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/api/debug/fix-event-ids">Reparar IDs de eventos</Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/api/repair-database">Reparar base de datos</Link>
              </Button>
            </div>

            {responseDetails && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Detalles de la respuesta:</h3>
                <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-60">{responseDetails}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/eventos")} className="w-full">
              Ver todos los eventos
            </Button>
          </CardFooter>
        </Card>
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
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push("/dashboard/eventos")}>Ver todos los eventos</Button>
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.date)
  const formattedTime = eventDate.toLocaleTimeString("es-PR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  // URL pública del evento
  const publicEventUrl = event.shareableSlug ? `https://www.interprfc.com/eventos/${event.shareableSlug}` : null

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
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Eliminando...
              </>
            ) : (
              <>
                <Trash className="h-4 w-4 mr-2" />
                Eliminar
              </>
            )}
          </Button>
        </div>
      </div>

      {event.shareableSlug && (
        <Alert>
          <Share2 className="h-4 w-4" />
          <AlertTitle>Evento público</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <p>Este evento está disponible para registro público. Comparte el siguiente enlace:</p>
            <div className="flex items-center space-x-2">
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                {publicEventUrl}
              </code>
              <Button variant="outline" size="sm" className="h-8 px-2" onClick={copyShareableLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="mt-2">
              <Button variant="outline" size="sm" asChild>
                <a href={publicEventUrl} target="_blank" rel="noopener noreferrer">
                  Ver página pública
                </a>
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
                      <p className="text-sm text-muted-foreground">{event.shareableSlug ? "Sí" : "No"}</p>
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
                {registrationCount === 0 && event.shareableSlug && (
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
