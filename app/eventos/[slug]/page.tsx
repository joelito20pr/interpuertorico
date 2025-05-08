"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, MapPin, DollarSign, Users, ArrowLeft, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { isValidUrl } from "@/lib/utils"

export default function EventoPublicoPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    numberOfAttendees: "1",
    paymentReference: "",
  })

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/slug/${params.slug}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("El evento no existe o no está disponible para registro público")
            setIsLoading(false)
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          setEvent(result.data)
        } else {
          setError(result.error || "No se pudo cargar la información del evento")
        }
      } catch (error) {
        console.error("Error loading event:", error)
        setError(`Error al cargar el evento: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [params.slug])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    try {
      // Validación básica
      if (!formData.name || !formData.email) {
        setError("Por favor complete todos los campos requeridos")
        setIsSubmitting(false)
        return
      }

      // Si requiere pago, validar referencia de pago
      if (event.requiresPayment && !formData.paymentReference) {
        setError("Por favor ingrese la referencia de pago")
        setIsSubmitting(false)
        return
      }

      // Registrar en el evento
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          numberOfAttendees: Number.parseInt(formData.numberOfAttendees),
          paymentReference: formData.paymentReference,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        toast({
          title: "Registro exitoso",
          description: "Te has registrado correctamente para este evento",
        })
      } else {
        throw new Error(result.error || "Error al registrarse en el evento. Por favor intente nuevamente.")
      }
    } catch (error) {
      console.error("Error registering for event:", error)
      setError(`Error al registrarse: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "EEEE d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es })
    } catch (e) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">¡Registro Exitoso!</CardTitle>
              <CardDescription>Te has registrado correctamente para el evento</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="mb-4">{formatDate(event.date)}</p>
              <p className="mb-4">Hemos enviado un correo electrónico con los detalles a {formData.email}</p>
              {event.requiresPayment && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Información de pago</AlertTitle>
                  <AlertDescription>
                    Tu registro está pendiente de confirmación de pago. Si ya realizaste el pago, será confirmado en
                    breve.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/">Volver al inicio</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription>Información del evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Fecha y hora</h3>
                    <p>{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Ubicación</h3>
                    {isValidUrl(event.location) ? (
                      <a
                        href={event.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {event.location}
                      </a>
                    ) : (
                      <p>{event.location}</p>
                    )}
                  </div>
                </div>
                {event.requiresPayment && (
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Precio</h3>
                      <p>{event.price}</p>
                      {event.stripeLink && (
                        <a
                          href={event.stripeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Pagar en línea
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {event.maxAttendees && (
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Capacidad</h3>
                      <p>
                        {event.registrationsCount} / {event.maxAttendees} asistentes
                        {event.remainingSpots === 0 ? (
                          <span className="text-red-600 ml-2">Agotado</span>
                        ) : (
                          <span className="text-green-600 ml-2">
                            {event.remainingSpots} {event.remainingSpots === 1 ? "lugar" : "lugares"} disponibles
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {event.description && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Descripción</h3>
                    <p className="whitespace-pre-line">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Registro</CardTitle>
                <CardDescription>Completa el formulario para registrarte</CardDescription>
              </CardHeader>
              <CardContent>
                {!event.isAvailable ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Evento completo</AlertTitle>
                    <AlertDescription>Este evento ha alcanzado su capacidad máxima.</AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@ejemplo.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(787) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfAttendees">Número de asistentes</Label>
                      <Input
                        id="numberOfAttendees"
                        name="numberOfAttendees"
                        type="number"
                        min="1"
                        max={event.maxAttendees ? event.remainingSpots : "99"}
                        value={formData.numberOfAttendees}
                        onChange={handleInputChange}
                      />
                    </div>
                    {event.requiresPayment && (
                      <div className="space-y-2">
                        <Label htmlFor="paymentReference">Referencia de pago *</Label>
                        <Input
                          id="paymentReference"
                          name="paymentReference"
                          value={formData.paymentReference}
                          onChange={handleInputChange}
                          placeholder="Número de confirmación de pago"
                          required
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Realiza el pago a través de{" "}
                          <a
                            href={event.stripeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            este enlace
                          </a>{" "}
                          y luego ingresa el número de confirmación.
                        </p>
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Enviando..." : "Registrarme"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
