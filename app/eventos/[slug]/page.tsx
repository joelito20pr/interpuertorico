"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { LocationDisplay } from "@/components/location-display"

export default function EventoPublicoPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [registrationCount, setRegistrationCount] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    guardianName: "",
    email: "",
    phone: "",
    numberOfAttendees: 1,
  })

  const loadEvent = async () => {
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log("Fetching event with slug:", params.slug)
      const response = await fetch(`/api/events/slug/${params.slug}`)

      if (!response.ok) {
        console.error("API response not OK:", response.status)
        const errorData = await response.json().catch(() => ({}))
        setDebugInfo(errorData.debug || null)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("API response:", result)

      if (result.success) {
        setEvent(result.data)
        setRegistrationCount(result.data.registrationsCount || 0)
      } else {
        setError(result.error || "Error al cargar el evento")
        setDebugInfo(result.debug || null)
      }
    } catch (error) {
      console.error("Error loading event:", error)
      setError(`Error al cargar el evento: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEvent()
  }, [params.slug])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          eventId: event.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("¡Registro completado con éxito! Te hemos enviado un correo de confirmación.")
        setFormData({
          name: "",
          guardianName: "",
          email: "",
          phone: "",
          numberOfAttendees: 1,
        })
        // Actualizar el conteo de registros
        setRegistrationCount((prev) => prev + 1)
      } else {
        setError(result.error || "Error al procesar el registro")
      }
    } catch (error) {
      console.error("Error submitting registration:", error)
      setError(`Error al procesar el registro: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Información de depuración</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Slug solicitado: <code>{params.slug}</code>
            </p>

            {debugInfo && debugInfo.availableSlugs && debugInfo.availableSlugs.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Slugs disponibles:</p>
                <ul className="text-sm space-y-1">
                  {debugInfo.availableSlugs.map((slug: string, index: number) => (
                    <li key={index}>
                      <Link href={`/eventos/${slug}`} className="text-blue-600 hover:underline">
                        {slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={loadEvent} className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar nuevamente
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Herramientas de diagnóstico:</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/api/debug/check-slug?slug=torneo-prueba-265" passHref>
              <Button variant="outline" size="sm">
                Verificar slugs
              </Button>
            </Link>
            <Link href="/api/events/regenerate-all-slugs" passHref>
              <Button variant="outline" size="sm">
                Regenerar todos los slugs
              </Button>
            </Link>
            <Link href="/api/debug/list-events" passHref>
              <Button variant="outline" size="sm">
                Listar eventos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Evento no encontrado o no disponible.</p>
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

  const isRegistrationFull = event.maxAttendees && registrationCount >= event.maxAttendees

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formattedTime}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <LocationDisplay location={event.location} />
                  </div>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>{event.description || "No hay descripción disponible para este evento."}</p>
            </div>

            {event.maxAttendees && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Cupos disponibles:</strong> {Math.max(0, event.maxAttendees - registrationCount)} de{" "}
                  {event.maxAttendees}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {isRegistrationFull ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Registro cerrado</AlertTitle>
            <AlertDescription>
              Lo sentimos, este evento ha alcanzado su capacidad máxima de participantes.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Registro para el evento</CardTitle>
              <CardDescription>Completa el formulario para registrarte en este evento</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>¡Registro exitoso!</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del jugador *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Nombre del encargado</Label>
                    <Input
                      id="guardianName"
                      name="guardianName"
                      value={formData.guardianName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (787) 123-4567"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">Incluye el código de país (ej: +1 para Puerto Rico)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfAttendees">Cantidad de participantes *</Label>
                    <Input
                      id="numberOfAttendees"
                      name="numberOfAttendees"
                      type="number"
                      min="1"
                      max={event.maxAttendees ? Math.min(10, event.maxAttendees - registrationCount) : 10}
                      value={formData.numberOfAttendees}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <CardFooter className="px-0 pt-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Procesando..." : "Completar registro"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
